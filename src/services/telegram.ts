// 텔레그램 봇 API 연동 서비스
// 브라우저에서 직접 텔레그램 봇 API(CORS 허용)를 호출하여 실시간 메시지 발송 및 수신

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
}

const STORAGE_KEY = 'macos_portfolio_telegram_config';

// 기본 설정 가져오기 (localStorage 또는 빈 값)
export const getTelegramConfig = (): TelegramConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load telegram config from localStorage:', e);
  }

  // 기본값 (사용자가 UI 또는 스크립트에서 입력 가능)
  return {
    botToken: '',
    chatId: '',
    isEnabled: false,
  };
};

// 텔레그램 설정 저장
export const saveTelegramConfig = (config: TelegramConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save telegram config:', e);
  }
};

export interface SendMessageResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

// 텔레그램으로 방문자 메시지 전송
export const sendTelegramMessage = async (
  text: string,
  senderName: string = '포트폴리오 방문자'
): Promise<SendMessageResult> => {
  const config = getTelegramConfig();

  if (!config.botToken || !config.chatId) {
    return {
      success: false,
      error: '텔레그램 봇 토큰과 Chat ID가 설정되지 않았습니다.',
    };
  }

  const now = new Date();
  const timeStr = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()} ${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const formattedText = `💬 [포트폴리오 iMessage 도착]
━━━━━━━━━━━━━━━
👤 발신: ${senderName}
🕒 일시: ${timeStr}

📝 내용:
${text}
━━━━━━━━━━━━━━━
💡 텔레그램에서 이 메시지에 [답장]하시면 포트폴리오 웹사이트 화면에 실시간으로 회신됩니다!`;

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: formattedText,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      return {
        success: true,
        messageId: data.result?.message_id,
      };
    } else {
      return {
        success: false,
        error: data.description || '텔레그램 메시지 전송 실패',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || '네트워크 오류가 발생했습니다.',
    };
  }
};

// 텔레그램 연동 테스트 메시지 발송
export const testTelegramConnection = async (
  botToken: string,
  chatId: string
): Promise<{ success: boolean; botName?: string; error?: string }> => {
  try {
    // 1. 봇 정보 확인 (getMe)
    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      return {
        success: false,
        error: `봇 토큰 오류: ${meData.description || '유효하지 않은 봇 토큰입니다.'}`,
      };
    }

    const botName = meData.result?.first_name || meData.result?.username || '알림 봇';

    // 2. 테스트 메시지 발송
    const sendRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🎉 [macOS 포트폴리오 연동 성공]
안녕하세요 오종진님!
메시지 앱(iMessage)과 텔레그램 봇(@${meData.result?.username})이 성공적으로 연결되었습니다.

웹사이트에 방문자가 메시지를 작성하면 이 채팅방으로 즉시 알림이 전달됩니다.`,
        }),
      }
    );

    const sendData = await sendRes.json();

    if (sendData.ok) {
      return { success: true, botName };
    } else {
      return {
        success: false,
        error: `메시지 발송 실패: ${sendData.description || 'Chat ID를 다시 확인해 주세요.'}`,
      };
    }
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || '텔레그램 API 연결에 실패했습니다.',
    };
  }
};

// 텔레그램 봇 답장 수신 (Polling getUpdates)
export interface TelegramUpdateMessage {
  updateId: number;
  text: string;
  date: number;
}

export const fetchTelegramReplies = async (
  lastUpdateId: number
): Promise<{ updates: TelegramUpdateMessage[]; newLastUpdateId: number }> => {
  const config = getTelegramConfig();

  if (!config.botToken || !config.chatId) {
    return { updates: [], newLastUpdateId: lastUpdateId };
  }

  try {
    const offset = lastUpdateId > 0 ? lastUpdateId + 1 : 0;
    const res = await fetch(
      `https://api.telegram.org/bot${config.botToken}/getUpdates?offset=${offset}&timeout=2`,
      { method: 'GET' }
    );

    const data = await res.json();

    if (!data.ok || !Array.isArray(data.result)) {
      return { updates: [], newLastUpdateId: lastUpdateId };
    }

    const replies: TelegramUpdateMessage[] = [];
    let highestUpdateId = lastUpdateId;

    for (const item of data.result) {
      if (item.update_id > highestUpdateId) {
        highestUpdateId = item.update_id;
      }

      // 오종진 본인(chatId)이 보낸 메시지인 경우에만 회신으로 처리
      const msg = item.message;
      if (msg && String(msg.chat?.id) === String(config.chatId) && msg.text) {
        // 커맨드(/start 등) 제외
        if (!msg.text.startsWith('/')) {
          replies.push({
            updateId: item.update_id,
            text: msg.text,
            date: msg.date,
          });
        }
      }
    }

    return { updates: replies, newLastUpdateId: highestUpdateId };
  } catch (e) {
    // 백그라운드 폴링 실패 시 무시
    return { updates: [], newLastUpdateId: lastUpdateId };
  }
};
