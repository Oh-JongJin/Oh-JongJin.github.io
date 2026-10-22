import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDevice } from '../hooks/useDevice';
import {
  RotateCcw,
  Sparkles,
  Briefcase,
  X,
  HelpCircle,
  CheckCircle2,
  Gauge,
} from 'lucide-react';

// ==================== 게임 상수 정의 ====================
const GAME_WIDTH = 660;
const GAME_HEIGHT = 370;
const MOVE_SPEED = 160; // 픽셀/초

// 충돌 좌석 및 벽 데이터 (발바닥 Y 기준)
const COLLIDERS = [
  // 상/하단 벽
  { x: 0, y: 0, w: 660, h: 48 },
  { x: 0, y: 345, w: 660, h: 30 },
  // 출입문 기둥/모서리
  { x: 0, y: 0, w: 85, h: 105 },
  { x: 575, y: 0, w: 85, h: 105 },
  { x: 0, y: 285, w: 85, h: 85 },
  { x: 575, y: 285, w: 85, h: 85 },
  // 좌석 4개 구역
  { x: 120, y: 68, w: 205, h: 46 }, // 상단 좌측
  { x: 335, y: 68, w: 205, h: 46 }, // 상단 우측
  { x: 108, y: 268, w: 215, h: 80 }, // 하단 좌측
  { x: 338, y: 268, w: 215, h: 80 }, // 하단 우측
];

interface GameItem {
  id: string;
  name: string;
  description: string;
  detailText?: string;
  iconPath: string;
  openTexturePath?: string;
  detailTexturePath?: string;
  carNumber: number;
  x: number;
  y: number;
  readiness: number;
  excitement: number;
  hiddenByEvent?: boolean;
}

export const SubwayGameApp: React.FC = () => {
  const { isMobile } = useDevice();
  const isMobileRef = useRef(isMobile);

  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ==================== 게임 상태 ====================
  const [currentCar, setCurrentCar] = useState(4); // 5-4호차부터 시작
  const [fadeAlpha, setFadeAlpha] = useState(0); // 호차 전환 페이드

  // 게이지 (설렘도, 긴장도, 준비도)
  const [excitement, setExcitement] = useState(10);
  const [nervousness, setNervousness] = useState(30);
  const [readiness, setReadiness] = useState(0);

  // 메시지 박스
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 인벤토리 & 아이템 뷰어
  const [inventory, setInventory] = useState<GameItem[]>([]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [activeViewerItem, setActiveViewerItem] = useState<GameItem | null>(null);
  const [viewerState, setViewerState] = useState<0 | 1 | 2>(0); // 0: 닫힌봉투, 1: 열린봉투, 2: 편지지
  const [isEnvelopeShaking, setIsEnvelopeShaking] = useState(false);

  // 잠든 승객 상태
  const [isPassengerAwake, setIsPassengerAwake] = useState(false);
  const [passengerOffset, setPassengerOffset] = useState({ x: 0, y: 0 });

  // 상호작용 가능 힌트
  const [nearbyInteractable, setNearbyInteractable] = useState<string | null>(null);

  // 게임 클리어 팝업
  const [isGameCleared, setIsGameCleared] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 캐릭터 이동 속도 (기본 200px/s, 기본 1.25x)
  const [moveSpeed, setMoveSpeed] = useState<number>(200);
  const moveSpeedRef = useRef<number>(200);

  // 플레이어 물리 및 애니메이션 ref (x, y는 발바닥 기준 위치)
  const playerRef = useRef({
    x: 386,
    y: 200, // 지면에 닿은 발바닥 Y 좌표
    vx: 0,
    vy: 0,
    facing: 'down' as 'down' | 'up' | 'left' | 'right',
    isMoving: false,
    walkFrame: 0,
    walkTimer: 0,
    canControl: true,
  });

  // 아이템 수집 목록 관리
  const [items, setItems] = useState<GameItem[]>([
    {
      id: 'handbag',
      name: '가방',
      description: '소지품을 다시 한번 확인했다.',
      iconPath: '/game/sprites/items/handbag.png',
      carNumber: 4,
      x: 200,
      y: 115,
      readiness: 15,
      excitement: 5,
    },
    {
      id: 'note',
      name: '메모 쪽지',
      description: '검정색 글씨로 무언가 적혀져 있다.',
      detailText: '긴장되면 물 한 잔 마셔',
      iconPath: '/game/sprites/items/note.png',
      openTexturePath: '/game/sprites/items/open_note.png',
      detailTexturePath: '/game/sprites/items/text_memo.png',
      carNumber: 4,
      x: 280,
      y: 200,
      readiness: 25,
      excitement: 10,
    },
    {
      id: 'smartphone',
      name: '스마트폰',
      description: '친구에게서 카톡이 왔다! "어디야?"',
      iconPath: '/game/sprites/items/smartphone.png',
      carNumber: 4,
      x: 450,
      y: 105,
      readiness: 20,
      excitement: 10,
      hiddenByEvent: true, // 잠든 승객을 깨운 뒤 등장
    },
    {
      id: 'earbuds',
      name: '이어폰',
      description: '좋아하는 플레이리스트를 들으니 기분이 좋아진다♪',
      iconPath: '/game/sprites/items/earbuds.png',
      carNumber: 3,
      x: 480,
      y: 265,
      readiness: 20,
      excitement: 10,
    },
    {
      id: 'candy',
      name: '사탕',
      description: '달콤한 레몬 사탕. 입안이 상쾌해지고 긴장이 조금 풀린다.',
      iconPath: '/game/sprites/items/candy.png',
      carNumber: 3,
      x: 220,
      y: 115,
      readiness: 10,
      excitement: 5,
    },
    {
      id: 'mirror',
      name: '손거울',
      description: '오늘 스타일 괜찮은 것 같다... 옷매무새를 다듬었다.',
      iconPath: '/game/sprites/items/mirror.png',
      carNumber: 2,
      x: 250,
      y: 220,
      readiness: 20,
      excitement: 10,
    },
  ]);

  // 이미지 에셋 캐싱
  const assetsRef = useRef<{ [key: string]: HTMLImageElement }>({});
  const [, setAssetsLoaded] = useState(false);

  // 키 입력 상태
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // ==================== 에셋 프리로드 ====================
  useEffect(() => {
    const assetList = [
      { key: 'bg', src: '/game/sprites/subway_interior.jpeg' },
      { key: 'player_idle', src: '/game/sprites/player/idle.png?v=4' },
      { key: 'player_left', src: '/game/sprites/player/left.png?v=3' },
      { key: 'player_right', src: '/game/sprites/player/right.png?v=3' },
      { key: 'player_back_left', src: '/game/sprites/player/back_left.png?v=3' },
      { key: 'player_back_right', src: '/game/sprites/player/back_right.png?v=3' },
      { key: 'player_side_right_idle', src: '/game/sprites/player/side_right_idle.png?v=5' },
      { key: 'player_side_right_walk1', src: '/game/sprites/player/side_right_walk1.png?v=5' },
      { key: 'player_side_right_walk2', src: '/game/sprites/player/side_right_walk2.png?v=5' },
      { key: 'player_side_left_idle', src: '/game/sprites/player/side_left_idle.png?v=5' },
      { key: 'player_side_left_walk1', src: '/game/sprites/player/side_left_walk1.png?v=5' },
      { key: 'player_side_left_walk2', src: '/game/sprites/player/side_left_walk2.png?v=5' },
      { key: 'sleeping_passenger', src: '/game/sprites/npc/sleeping_passenger.png' },
      { key: 'handbag', src: '/game/sprites/items/handbag.png' },
      { key: 'note', src: '/game/sprites/items/note.png' },
      { key: 'open_note', src: '/game/sprites/items/open_note.png' },
      { key: 'text_memo', src: '/game/sprites/items/text_memo.png' },
      { key: 'smartphone', src: '/game/sprites/items/smartphone.png' },
      { key: 'earbuds', src: '/game/sprites/items/earbuds.png' },
      { key: 'candy', src: '/game/sprites/items/candy.png' },
      { key: 'mirror', src: '/game/sprites/items/mirror.png' },
    ];

    let loadedCount = 0;
    assetList.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        assetsRef.current[key] = img;
        loadedCount++;
        if (loadedCount === assetList.length) {
          setAssetsLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === assetList.length) {
          setAssetsLoaded(true);
        }
      };
    });
  }, []);

  // ==================== 메시지 출력 시스템 ====================
  const showMessages = useCallback((msgs: string[]) => {
    setMessages(msgs);
    setCurrentMsgIndex(0);
    playerRef.current.canControl = false;
    playerRef.current.isMoving = false;
  }, []);

  // 타이핑 효과
  useEffect(() => {
    if (messages.length === 0 || currentMsgIndex >= messages.length) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    const fullMsg = messages[currentMsgIndex];
    let charIdx = 0;
    setIsTyping(true);
    setDisplayedText('');

    const timer = setInterval(() => {
      charIdx++;
      setDisplayedText(fullMsg.slice(0, charIdx));
      if (charIdx >= fullMsg.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 28);

    return () => clearInterval(timer);
  }, [messages, currentMsgIndex]);

  const advanceOrCloseMessage = useCallback(() => {
    if (messages.length === 0) return;

    if (isTyping) {
      // 타이핑 즉시 완료
      setDisplayedText(messages[currentMsgIndex]);
      setIsTyping(false);
      return;
    }

    if (currentMsgIndex + 1 < messages.length) {
      setCurrentMsgIndex((prev) => prev + 1);
    } else {
      // 대화창 닫기
      setMessages([]);
      playerRef.current.canControl = true;
    }
  }, [messages, currentMsgIndex, isTyping]);

  // ==================== 잠든 승객 깨우기 이벤트 ====================
  const wakeUpPassenger = useCallback(() => {
    if (isPassengerAwake) return;
    setIsPassengerAwake(true);

    // 머리 위로 깜짝 놀라 튀어오르는 트윈
    setPassengerOffset({ x: 0, y: -6 });
    setTimeout(() => setPassengerOffset({ x: 30, y: 0 }), 300);

    // 대화 표시
    showMessages([
      '"으...응? 아 죄송합니다... 졸았네요."',
      '"이거 혹시 손님 건가요? 의자 틈새에 떨어져 있었어요."',
    ]);

    // 스마트폰 아이템 공개
    setItems((prev) =>
      prev.map((item) => (item.id === 'smartphone' ? { ...item, hiddenByEvent: false } : item))
    );
  }, [isPassengerAwake, showMessages]);

  // ==================== 아이템 수집 로직 ====================
  const collectItem = useCallback(
    (item: GameItem) => {
      // 인벤토리 추가
      setInventory((prev) => (prev.some((i) => i.id === item.id) ? prev : [...prev, item]));

      // 맵에서 제거
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // 게이지 업데이트
      const newReadiness = Math.min(100, readiness + item.readiness);
      const newExcitement = Math.min(100, excitement + item.excitement);
      setReadiness(newReadiness);
      setExcitement(newExcitement);
      setNervousness((prev) => Math.max(5, prev - 5));

      // 획득 대사
      showMessages([`📦 [${item.name}] 획득!\n${item.description}`]);

      // 100% 준비 완료 체크
      if (newReadiness >= 100) {
        setTimeout(() => {
          setIsGameCleared(true);
        }, 1500);
      }
    },
    [readiness, excitement, showMessages]
  );

  // ==================== 호차 이동 전환 ====================
  const transitionCar = useCallback(
    (newCar: number, direction: 'left' | 'right') => {
      const player = playerRef.current;
      player.canControl = false;
      player.vx = 0;
      player.vy = 0;

      // 1. 페이드 아웃
      let alpha = 0;
      const fadeOutTimer = setInterval(() => {
        alpha += 0.08;
        if (alpha >= 1) {
          clearInterval(fadeOutTimer);
          setFadeAlpha(1);

          // 2. 칸 변경 및 플레이어 반대편 문 앞으로 이동
          setCurrentCar(newCar);
          if (direction === 'left') {
            player.x = 600;
          } else {
            player.x = 60;
          }

          // 잠깐 대기 후 페이드 인
          setTimeout(() => {
            let inAlpha = 1;
            const fadeInTimer = setInterval(() => {
              inAlpha -= 0.08;
              if (inAlpha <= 0) {
                clearInterval(fadeInTimer);
                setFadeAlpha(0);
                player.canControl = true;
              } else {
                setFadeAlpha(inAlpha);
              }
            }, 25);
          }, 150);
        } else {
          setFadeAlpha(alpha);
        }
      }, 25);
    },
    []
  );

  // ==================== 충돌 검사 (AABB - 발바닥 기준) ====================
  const checkCollision = (nx: number, ny: number) => {
    const pw = 20;
    const ph = 12;
    const px0 = nx - pw / 2;
    const py0 = ny - ph; // 발바닥 기준 상단
    const px1 = nx + pw / 2;
    const py1 = ny;

    for (const c of COLLIDERS) {
      if (px0 < c.x + c.w && px1 > c.x && py0 < c.y + c.h && py1 > c.y) {
        return true;
      }
    }
    return false;
  };

  // ==================== 게임 메인 루프 (Canvas Rendering) ====================
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let zzzTimer = 0;
    const zzzParticles: { x: number; y: number; alpha: number; size: number; text: string }[] = [];

    const loop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      zzzTimer += delta;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(loop);
        return;
      }

      const player = playerRef.current;

      // 1. 키보드 입력에 따른 플레이어 이동 (대각선 방지 및 4방향 직선 이동)
      if (player.canControl && messages.length === 0 && !isInventoryOpen) {
        let dx = 0;
        let dy = 0;

        if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) {
          dy = -1;
          player.facing = 'up';
        } else if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) {
          dy = 1;
          player.facing = 'down';
        } else if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) {
          dx = -1;
          player.facing = 'left';
        } else if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) {
          dx = 1;
          player.facing = 'right';
        }

        if (dx !== 0 || dy !== 0) {
          player.isMoving = true;
          player.walkTimer += delta;
          const currentSpeed = moveSpeedRef.current;
          const walkInterval = Math.max(0.06, 0.12 * (160 / currentSpeed));
          if (player.walkTimer >= walkInterval) {
            player.walkTimer = 0;
            player.walkFrame = (player.walkFrame + 1) % 2;
          }

          // X축 이동 및 충돌
          const nextX = player.x + dx * currentSpeed * delta;
          if (!checkCollision(nextX, player.y)) {
            player.x = nextX;
          }

          // Y축 이동 및 충돌
          const nextY = player.y + dy * currentSpeed * delta;
          if (!checkCollision(player.x, nextY)) {
            player.y = nextY;
          }

          // 지하철 호차 전환 체크
          if (player.x <= 30) {
            if (currentCar > 1) {
              transitionCar(currentCar - 1, 'left');
            } else {
              player.x = 30; // 5-1호차 왼쪽 막힘
            }
          } else if (player.x >= 630) {
            if (currentCar < 4) {
              transitionCar(currentCar + 1, 'right');
            } else {
              player.x = 630; // 5-4호차 오른쪽 막힘
            }
          }
        } else {
          player.isMoving = false;
          player.walkFrame = 0;
          player.walkTimer = 0;
        }
      }

      // 2. 주변 상호작용 체크
      let activeHint: string | null = null;
      if (player.canControl && messages.length === 0) {
        const actionKey = isMobileRef.current ? 'A' : 'F';
        // 아이템 체크
        const nearbyItem = items.find(
          (item) =>
            item.carNumber === currentCar &&
            !item.hiddenByEvent &&
            Math.hypot(player.x - item.x, player.y - item.y) < 38
        );
        if (nearbyItem) {
          activeHint = `[${actionKey}] ${nearbyItem.name} 조사하기`;
        } else if (currentCar === 4 && !isPassengerAwake) {
          // 승객 체크
          const pDist = Math.hypot(player.x - (445 + passengerOffset.x), player.y - 100);
          if (pDist < 46) {
            activeHint = `[${actionKey}] 승객 깨우기`;
          }
        }
      }
      setNearbyInteractable(activeHint);

      // ==================== 렌더링 시작 (화면 고정: 카메라 흔들림 제거) ====================
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // 3. 배경 렌더링 (흔들림 없이 안정적인 고정 배경)
      const bgImg = assetsRef.current['bg'];
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      } else {
        ctx.fillStyle = '#1e2430';
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      // 4. 호차별 아이템 렌더링
      items.forEach((item) => {
        if (item.carNumber === currentCar && !item.hiddenByEvent) {
          const itemImg = assetsRef.current[item.id];
          if (itemImg) {
            ctx.save();
            ctx.drawImage(itemImg, item.x - 14, item.y - 14, 28, 28);

            // 반짝임 하이라이트 테두리
            ctx.strokeStyle = 'rgba(255, 230, 100, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(item.x, item.y, 16, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }
      });

      // 5. 잠든 승객 NPC (4호차)
      if (currentCar === 4) {
        const passImg = assetsRef.current['sleeping_passenger'];
        if (passImg) {
          ctx.save();
          let dozeY = 0;
          if (!isPassengerAwake) {
            const dozeCycle = (performance.now() / 1000 * 1.5) % 4;
            if (dozeCycle > 2.5 && dozeCycle < 3.2) {
              dozeY = (dozeCycle - 2.5) * 6; // 천천히 머리가 떨굼
            } else if (dozeCycle >= 3.2 && dozeCycle < 3.5) {
              dozeY = 4.2 - (dozeCycle - 3.2) * 14; // 번쩍 깸
            }
          }

          const px = 445 + passengerOffset.x;
          const py = 76 + passengerOffset.y + dozeY;
          ctx.drawImage(passImg, px - 28, py, 56, 56);

          // 졸음 zZZ 파티클 스폰 & 렌더링
          if (!isPassengerAwake) {
            if (zzzTimer > 0.9) {
              zzzTimer = 0;
              const texts = ['z', 'Z', 'Z'];
              const chosenText = texts[Math.floor(Math.random() * texts.length)];
              zzzParticles.push({
                x: px + 16 + (Math.random() - 0.5) * 8,
                y: py - 2,
                alpha: 1.0,
                size: chosenText === 'z' ? 11 : 15,
                text: chosenText,
              });
            }

            // zZZ 렌더링
            for (let i = zzzParticles.length - 1; i >= 0; i--) {
              const p = zzzParticles[i];
              p.y -= delta * 14;
              p.x += delta * 4;
              p.alpha -= delta * 0.45;

              ctx.font = `bold ${p.size}px monospace`;
              ctx.fillStyle = `rgba(210, 230, 255, ${Math.max(0, p.alpha)})`;
              ctx.fillText(p.text, p.x, p.y);

              if (p.alpha <= 0) {
                zzzParticles.splice(i, 1);
              }
            }
          }

          ctx.restore();
        }
      }

      // 6. 플레이어 렌더링 (진행 방향에 맞춘 4방향 스프라이트 & 지면 밀착)
      ctx.save();
      let playerSpriteKey = 'player_idle';

      if (player.facing === 'up') {
        if (player.isMoving) {
          playerSpriteKey = player.walkFrame === 0 ? 'player_back_left' : 'player_back_right';
        } else {
          playerSpriteKey = 'player_back_left';
        }
      } else if (player.facing === 'left') {
        // 왼쪽 이동: 흰색 가방이 항상 선명하게 유지되는 전용 왼쪽 스프라이트 (깜빡임 없음)
        if (player.isMoving) {
          playerSpriteKey = player.walkFrame === 0 ? 'player_side_left_walk1' : 'player_side_left_walk2';
        } else {
          playerSpriteKey = 'player_side_left_idle';
        }
      } else if (player.facing === 'right') {
        // 오른쪽 이동: 흰색 가방이 반대편에 가려져 보이지 않는 전용 오른쪽 스프라이트
        if (player.isMoving) {
          playerSpriteKey = player.walkFrame === 0 ? 'player_side_right_walk1' : 'player_side_right_walk2';
        } else {
          playerSpriteKey = 'player_side_right_idle';
        }
      } else {
        // down
        if (player.isMoving) {
          playerSpriteKey = player.walkFrame === 0 ? 'player_left' : 'player_right';
        } else {
          playerSpriteKey = 'player_idle';
        }
      }

      const playerImg = assetsRef.current[playerSpriteKey];
      if (playerImg) {
        // 그림자: 발바닥(player.y) 바로 아래에 밀착
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y - 1, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 스프라이트 그리기: 발바닥이 player.y에 정확히 닿도록 y - 54 배치 (36x54)
        // 서 있을 때와 걸을 때 머리통과 몸체가 1픽셀도 흔들리지 않고 완벽히 고정
        ctx.drawImage(playerImg, player.x - 18, player.y - 54, 36, 54);
      }
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [currentCar, items, isPassengerAwake, passengerOffset, messages.length, isInventoryOpen, transitionCar]);

  // ==================== 키보드 이벤트 핸들러 ====================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 뷰어가 열려있을 때
      if (activeViewerItem) {
        if (e.key === 'Escape') {
          setActiveViewerItem(null);
          setViewerState(0);
        } else if (e.key === ' ' || e.key === 'Enter') {
          handleViewerClick();
        }
        return;
      }

      // 인벤토리 열기 / 닫기
      if (e.key.toLowerCase() === 'i') {
        if (messages.length === 0) {
          setIsInventoryOpen((prev) => !prev);
        }
        return;
      }

      // 메시지 박스 진행
      if (messages.length > 0) {
        if (e.key === 'f' || e.key === 'F' || e.key === 'Enter' || e.key === ' ') {
          advanceOrCloseMessage();
        }
        return;
      }

      // 상호작용 (F키)
      if (e.key.toLowerCase() === 'f' || e.key === ' ') {
        const player = playerRef.current;
        // 1. 아이템 조사
        const nearbyItem = items.find(
          (item) =>
            item.carNumber === currentCar &&
            !item.hiddenByEvent &&
            Math.hypot(player.x - item.x, player.y - item.y) < 38
        );
        if (nearbyItem) {
          collectItem(nearbyItem);
          return;
        }

        // 2. 잠든 승객 깨우기
        if (currentCar === 4 && !isPassengerAwake) {
          const pDist = Math.hypot(player.x - (445 + passengerOffset.x), player.y - 100);
          if (pDist < 46) {
            wakeUpPassenger();
            return;
          }
        }
      }

      // 이동 키 등록
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    items,
    currentCar,
    isPassengerAwake,
    passengerOffset,
    messages,
    activeViewerItem,
    advanceOrCloseMessage,
    collectItem,
    wakeUpPassenger,
  ]);

  // 편지 봉투 열기 클릭 연출
  const handleViewerClick = () => {
    if (viewerState === 0) {
      // 닫힌 봉투 -> 흔들리며 열린 봉투
      setIsEnvelopeShaking(true);
      setTimeout(() => {
        setIsEnvelopeShaking(false);
        setViewerState(1);
      }, 350);
    } else if (viewerState === 1) {
      // 열린 봉투 -> 손글씨 편지지 등장
      setViewerState(2);
    } else {
      // 닫기
      setActiveViewerItem(null);
      setViewerState(0);
    }
  };

  // 게임 리셋
  const handleResetGame = () => {
    setCurrentCar(4);
    setExcitement(10);
    setNervousness(30);
    setReadiness(0);
    setInventory([]);
    setIsPassengerAwake(false);
    setPassengerOffset({ x: 0, y: 0 });
    setIsGameCleared(false);
    playerRef.current.x = 386;
    playerRef.current.y = 200;
    playerRef.current.canControl = true;
    // 아이템 리셋
    setItems([
      {
        id: 'handbag',
        name: '가방',
        description: '소지품을 다시 한번 확인했다.',
        iconPath: '/game/sprites/items/handbag.png',
        carNumber: 4,
        x: 200,
        y: 115,
        readiness: 15,
        excitement: 5,
      },
      {
        id: 'note',
        name: '메모 쪽지',
        description: '검정색 글씨로 무언가 적혀져 있다.',
        detailText: '긴장되면 물 한 잔 마셔',
        iconPath: '/game/sprites/items/note.png',
        openTexturePath: '/game/sprites/items/open_note.png',
        detailTexturePath: '/game/sprites/items/text_memo.png',
        carNumber: 4,
        x: 280,
        y: 200,
        readiness: 25,
        excitement: 10,
      },
      {
        id: 'smartphone',
        name: '스마트폰',
        description: '친구에게서 카톡이 왔다! "어디야?"',
        iconPath: '/game/sprites/items/smartphone.png',
        carNumber: 4,
        x: 450,
        y: 105,
        readiness: 20,
        excitement: 10,
        hiddenByEvent: true,
      },
      {
        id: 'earbuds',
        name: '이어폰',
        description: '좋아하는 플레이리스트를 들으니 기분이 좋아진다♪',
        iconPath: '/game/sprites/items/earbuds.png',
        carNumber: 3,
        x: 480,
        y: 265,
        readiness: 20,
        excitement: 10,
      },
      {
        id: 'candy',
        name: '사탕',
        description: '달콤한 레몬 사탕. 입안이 상쾌해지고 긴장이 조금 풀린다.',
        iconPath: '/game/sprites/items/candy.png',
        carNumber: 3,
        x: 220,
        y: 115,
        readiness: 10,
        excitement: 5,
      },
      {
        id: 'mirror',
        name: '손거울',
        description: '오늘 스타일 괜찮은 것 같다... 옷매무새를 다듬었다.',
        iconPath: '/game/sprites/items/mirror.png',
        carNumber: 2,
        x: 250,
        y: 220,
        readiness: 20,
        excitement: 10,
      },
    ]);
  };

  // 모바일 가상 패드 터치 핸들러
  const handleVirtualDpad = (code: string, active: boolean) => {
    keysRef.current[code] = active;
  };

  return (
    <div className="relative w-full h-full bg-[#12151d] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* ==================== 상단 툴바 / 정보창 ==================== */}
      <div className="h-10 bg-[#1e2330]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between border-b border-white/10 z-20">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>안녕</span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-neutral-400">
            Godot 2D Engine Web Port
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* 가방/인벤토리 버튼 */}
          <button
            onClick={() => setIsInventoryOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
            title="소지품 인벤토리 (I)"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">가방</span>
            <span className="px-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
              {inventory.length}
            </span>
          </button>

          {/* 다시하기 */}
          <button
            onClick={handleResetGame}
            className="p-1.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="게임 처음부터 다시 시작"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* 도움말 */}
          <button
            onClick={() => setShowHelp((prev) => !prev)}
            className="p-1.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
            title="조작법 안내"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* 캐릭터 이동 속도 조절 슬라이더 */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md bg-white/10 border border-white/10 hover:bg-white/15 transition-colors"
            title={`캐릭터 이동 속도: ${(moveSpeed / 160).toFixed(1)}x (${moveSpeed}px/s)`}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <input
              type="range"
              min="120"
              max="320"
              step="10"
              value={moveSpeed}
              onChange={(e) => {
                const val = Number(e.target.value);
                setMoveSpeed(val);
                moveSpeedRef.current = val;
              }}
              className="w-14 sm:w-20 h-1.5 bg-neutral-700/80 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
            />
            <span className="text-[10px] font-mono font-bold text-amber-300 min-w-[28px] text-right select-none">
              {(moveSpeed / 160).toFixed(1)}x
            </span>
          </div>
        </div>
      </div>

      {/* ==================== 게임 메인 뷰포트 영역 ==================== */}
      <div className="relative flex-1 flex items-center justify-center bg-black/60 overflow-hidden">
        {/* 실제 2D Canvas */}
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full max-w-[800px] max-h-[460px] object-contain shadow-2xl"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* 호차 전환 암전 페이드 레이어 */}
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
          style={{ opacity: fadeAlpha }}
        />

        {/* ==================== 준비도 HUD (우측 상단) ==================== */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/70 backdrop-blur-md border border-white/15 rounded-xl p-2.5 sm:p-3 min-w-[120px] sm:min-w-[140px] shadow-2xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-300 mb-2 pb-1 border-b border-white/10">
            <span>5-{currentCar}호차</span>
          </div>

          {/* ✨ 준비도 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-amber-300 font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> 준비도
              </span>
              <span>{Math.round(readiness)}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-700/80 rounded-full overflow-hidden border border-amber-400/30">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                style={{ width: `${readiness}%` }}
              />
            </div>
          </div>
        </div>

        {/* ==================== 인터랙션 프롬프트 (머리 위 힌트) ==================== */}
        {nearbyInteractable && messages.length === 0 && !isInventoryOpen && (
          <div className="absolute bottom-16 sm:bottom-20 z-10 px-3 py-1.5 rounded-full bg-neutral-900/90 text-amber-300 border border-amber-400/40 text-xs font-semibold shadow-2xl backdrop-blur-md animate-bounce">
            {nearbyInteractable}
          </div>
        )}

        {/* ==================== 쯔꾸르 스타일 하단 대화창 ==================== */}
        {messages.length > 0 && (
          <div
            onClick={advanceOrCloseMessage}
            className="absolute bottom-4 left-4 right-4 sm:left-12 sm:right-12 z-30 p-4 rounded-xl bg-[#080b14]/95 border-2 border-white/20 shadow-2xl cursor-pointer select-none backdrop-blur-lg"
          >
            <div className="text-xs text-neutral-400 font-semibold mb-1 flex items-center justify-between">
              <span>💬 대화 및 확인</span>
              <span className="text-[10px] text-neutral-500">
                {isMobile ? '[A / 터치] 넘기기' : '[F / Enter / 클릭] 넘기기'}
              </span>
            </div>
            <div className="text-sm sm:text-base font-medium text-white min-h-[48px] whitespace-pre-line leading-relaxed">
              {displayedText}
              {!isTyping && <span className="inline-block ml-1 animate-pulse text-amber-300">▼</span>}
            </div>
          </div>
        )}

        {/* ==================== 인벤토리 UI 모달 (I키) ==================== */}
        {isInventoryOpen && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#161b28] border border-white/20 rounded-2xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-100">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>소지품 가방 (인벤토리)</span>
                </div>
                <button
                  onClick={() => setIsInventoryOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-400">
                  아직 수집한 아이템이 없습니다. 지하철 칸을 돌아다니며 아이템을 찾아보세요!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
                  {inventory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveViewerItem(item);
                        setViewerState(0);
                      }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all cursor-pointer flex flex-col items-center text-center gap-2 group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                        <img
                          src={item.iconPath}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 line-clamp-2">
                        {item.description}
                      </span>
                      {item.openTexturePath && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold">
                          확인 가능 ✉️
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-white/10 text-center text-[10px] text-neutral-400">
                아이템을 클릭하면 자세히 살펴볼 수 있습니다. (메모 쪽지 개봉 가능)
              </div>
            </div>
          </div>
        )}

        {/* ==================== 메모 쪽지 / 아이템 상세 뷰어 ==================== */}
        {activeViewerItem && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <button
              onClick={() => {
                setActiveViewerItem(null);
                setViewerState(0);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-3">
              <h3 className="text-base font-bold text-neutral-100">{activeViewerItem.name}</h3>
              <p className="text-xs text-neutral-400">{activeViewerItem.description}</p>
            </div>

            {/* 편지 개봉 애니메이션 컨테이너 */}
            <div
              onClick={handleViewerClick}
              className={`relative cursor-pointer transition-transform ${
                isEnvelopeShaking ? 'animate-bounce' : 'hover:scale-105'
              }`}
            >
              {viewerState === 0 && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={activeViewerItem.iconPath}
                    alt="닫힌 봉투"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  {activeViewerItem.openTexturePath && (
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-bold animate-pulse">
                      [Space / 클릭] 봉투 열기 ✉️
                    </span>
                  )}
                </div>
              )}

              {viewerState === 1 && activeViewerItem.openTexturePath && (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={activeViewerItem.openTexturePath}
                    alt="열린 봉투"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain drop-shadow-2xl"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-bold">
                    [클릭] 편지지 확인하기 📜
                  </span>
                </div>
              )}

              {viewerState === 2 && activeViewerItem.detailTexturePath && (
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                  <img
                    src={activeViewerItem.detailTexturePath}
                    alt="편지지 손글씨"
                    className="w-64 h-64 sm:w-72 sm:h-72 object-contain drop-shadow-2xl"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <div className="px-4 py-2 rounded-xl bg-neutral-900/90 border border-white/20 text-center">
                    <p className="text-sm font-bold text-amber-300">"긴장되면 물 한 잔 마셔"</p>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">
                      친구의 따뜻한 손글씨 응원이다.
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">[클릭 또는 ESC] 닫기</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 게임 클리어 완료 팝업 ==================== */}
        {isGameCleared && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-gradient-to-b from-[#1b263b] to-[#0d131f] border-2 border-amber-400/50 rounded-2xl p-6 text-center shadow-2xl animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-400/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">준비 완료! 🎉</h2>
              <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
                지하철 안에서 필요한 소지품을 모두 챙기고,
                <br />
                친구의 메모를 읽고 긴장을 가라앉혔습니다!
                <br />
                이제 당당하게 약속 장소로 나아갈 수 있습니다. ✨
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsGameCleared(false)}
                  className="flex-1 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors"
                >
                  지하철 더 둘러보기
                </button>
                <button
                  onClick={handleResetGame}
                  className="py-2 px-3 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
                >
                  다시하기
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 조작법 안내 모달 ==================== */}
        {showHelp && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xs bg-[#161b28] border border-white/20 rounded-xl p-4 text-xs text-neutral-300 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-white text-sm pb-1 border-b border-white/10">
                <span>게임 조작법</span>
                <button onClick={() => setShowHelp(false)}>
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              <div>
                <b className="text-amber-300">이동:</b> W, A, S, D / 방향키
              </div>
              <div>
                <b className="text-amber-300">조사 및 대화:</b> {isMobile ? 'A 버튼' : 'F 키 / 스페이스바'}
              </div>
              <div>
                <b className="text-amber-300">가방 열기:</b> I 키
              </div>
              <div>
                <b className="text-amber-300">호차 이동:</b> 지하철 왼쪽/오른쪽 끝 문으로 걷기
              </div>
              <div className="pt-1 text-[10px] text-neutral-400">
                * 모바일에서는 화면 아래의 가상 방향키와 A 버튼으로 조작하실 수 있습니다.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== 모바일 가상 조이스틱 (D-Pad & 액션 버튼) ==================== */}
      <div className="sm:hidden flex-shrink-0 h-36 bg-[#10141f] border-t border-white/10 px-4 sm:px-6 py-2 flex items-center justify-between z-20 select-none touch-none">
        {/* 가상 D-Pad (십자키) - 크기 확대 (48px 단위, 총 144px) */}
        <div className="relative w-36 h-36 flex items-center justify-center select-none touch-none">
          {/* 상 (▲) */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyW', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyW', false);
            }}
            onTouchCancel={() => handleVirtualDpad('KeyW', false)}
            onMouseDown={() => handleVirtualDpad('KeyW', true)}
            onMouseUp={() => handleVirtualDpad('KeyW', false)}
            onMouseLeave={() => handleVirtualDpad('KeyW', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-t-xl bg-neutral-800 active:bg-neutral-600 border-t border-x border-white/20 text-white font-bold text-lg flex items-center justify-center shadow-lg active:translate-y-0.5 transition-transform"
          >
            ▲
          </button>
          {/* 좌 (◀) */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyA', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyA', false);
            }}
            onTouchCancel={() => handleVirtualDpad('KeyA', false)}
            onMouseDown={() => handleVirtualDpad('KeyA', true)}
            onMouseUp={() => handleVirtualDpad('KeyA', false)}
            onMouseLeave={() => handleVirtualDpad('KeyA', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-l-xl bg-neutral-800 active:bg-neutral-600 border-l border-y border-white/20 text-white font-bold text-lg flex items-center justify-center shadow-lg active:-translate-x-0.5 transition-transform"
          >
            ◀
          </button>
          {/* 우 (▶) */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyD', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyD', false);
            }}
            onTouchCancel={() => handleVirtualDpad('KeyD', false)}
            onMouseDown={() => handleVirtualDpad('KeyD', true)}
            onMouseUp={() => handleVirtualDpad('KeyD', false)}
            onMouseLeave={() => handleVirtualDpad('KeyD', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-r-xl bg-neutral-800 active:bg-neutral-600 border-r border-y border-white/20 text-white font-bold text-lg flex items-center justify-center shadow-lg active:translate-x-0.5 transition-transform"
          >
            ▶
          </button>
          {/* 하 (▼) */}
          <button
            type="button"
            onTouchStart={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyS', true);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleVirtualDpad('KeyS', false);
            }}
            onTouchCancel={() => handleVirtualDpad('KeyS', false)}
            onMouseDown={() => handleVirtualDpad('KeyS', true)}
            onMouseUp={() => handleVirtualDpad('KeyS', false)}
            onMouseLeave={() => handleVirtualDpad('KeyS', false)}
            onContextMenu={(e) => e.preventDefault()}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-b-xl bg-neutral-800 active:bg-neutral-600 border-b border-x border-white/20 text-white font-bold text-lg flex items-center justify-center shadow-lg active:translate-y-0.5 transition-transform"
          >
            ▼
          </button>
          {/* 중앙 코어 */}
          <div className="w-12 h-12 bg-neutral-900 border border-white/10 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-neutral-950 border border-white/10" />
          </div>
        </div>

        {/* 액션 버튼 (A: 조사/확인, INV: 가방/인벤토리) */}
        <div className="flex items-center gap-3.5 select-none touch-none">
          {/* INV 버튼 */}
          <button
            type="button"
            onClick={() => setIsInventoryOpen((prev) => !prev)}
            className="w-12 h-12 rounded-full bg-neutral-700 active:bg-neutral-500 border border-white/20 text-xs font-bold text-amber-300 shadow-md flex items-center justify-center active:scale-95 transition-transform"
          >
            INV
          </button>
          {/* A 버튼 */}
          <button
            type="button"
            onClick={() => {
              if (messages.length > 0) {
                advanceOrCloseMessage();
              } else {
                const player = playerRef.current;
                const nearbyItem = items.find(
                  (item) =>
                    item.carNumber === currentCar &&
                    !item.hiddenByEvent &&
                    Math.hypot(player.x - item.x, player.y - item.y) < 38
                );
                if (nearbyItem) {
                  collectItem(nearbyItem);
                } else if (currentCar === 4 && !isPassengerAwake) {
                  wakeUpPassenger();
                }
              }
            }}
            className="w-16 h-16 rounded-full bg-rose-600 active:bg-rose-500 border-2 border-white/30 text-lg font-bold text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform"
          >
            A
          </button>
        </div>
      </div>
    </div>
  );
};
