#!/usr/bin/env python3
"""
macOS 포트폴리오 텔레그램 연동 테스트 프로그램
작성자: Antigravity & 오종진
용도: 텔레그램 봇 토큰 및 Chat ID 유효성 검증 및 실시간 메시지 발송/수신 테스트
"""

import sys
import json
import urllib.request
import urllib.parse
import time

def print_banner():
    print("=" * 60)
    print("🍎 macOS Portfolio - Telegram Notification Test Program")
    print("=" * 60)

def test_telegram_bot(bot_token: str, chat_id: str):
    print(f"\n[1/3] 텔레그램 봇 상태 확인 중...")
    get_me_url = f"https://api.telegram.org/bot{bot_token}/getMe"
    
    try:
        req = urllib.request.Request(get_me_url)
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            if not res_data.get("ok"):
                print("❌ 봇 정보 조회 실패:", res_data.get("description"))
                return False
            
            bot_info = res_data.get("result", {})
            bot_name = bot_info.get("first_name", "알림봇")
            bot_username = bot_info.get("username", "")
            print(f"✅ 봇 연결 성공!")
            print(f"   - 봇 이름: {bot_name}")
            print(f"   - 봇 사용자명: @{bot_username}")
    except Exception as e:
        print("❌ 텔레그램 API 요청 실패:", e)
        return False

    print(f"\n[2/3] 테스트 알림 메시지 발송 중 (Chat ID: {chat_id})...")
    send_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": f"🎉 [macOS 포트폴리오 연동 테스트]\n오종진님 안녕하세요!\n포트폴리오 메시지 앱과 텔레그램이 정상적으로 연결되었습니다.\n테스트 시각: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "parse_mode": "HTML"
    }

    try:
        req = urllib.request.Request(
            send_url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as response:
            send_res = json.loads(response.read().decode())
            if send_res.get("ok"):
                print("✅ 테스트 메시지 발송 성공!")
                print("   👉 본인의 텔레그램 앱을 확인해 보세요. 알림이 도착했을 것입니다.")
            else:
                print("❌ 메시지 발송 실패:", send_res.get("description"))
                return False
    except Exception as e:
        print("❌ 메시지 발송 에러:", e)
        return False

    print(f"\n[3/3] 양방향 수신(답장) 대기 테스트 (15초 동안 대기)...")
    print("   👉 텔레그램 앱에서 위 테스트 메시지에 아무 답장이나 입력해 보세요!")
    
    start_time = time.time()
    last_update_id = 0
    received = False

    while time.time() - start_time < 15:
        get_updates_url = f"https://api.telegram.org/bot{bot_token}/getUpdates?offset={last_update_id + 1}&timeout=3"
        try:
            req = urllib.request.Request(get_updates_url)
            with urllib.request.urlopen(req) as response:
                updates = json.loads(response.read().decode())
                if updates.get("ok"):
                    for item in updates.get("result", []):
                        last_update_id = max(last_update_id, item.get("update_id", 0))
                        msg = item.get("message", {})
                        if str(msg.get("chat", {}).get("id")) == str(chat_id) and msg.get("text"):
                            text = msg.get("text")
                            if not text.startswith("/"):
                                print(f"\n🎉 텔레그램에서 보낸 답장을 성공적으로 수신했습니다!")
                                print(f"   - 수신 내용: \"{text}\"")
                                received = True
                                break
            if received:
                break
        except Exception:
            pass
        time.sleep(1)

    if not received:
        print("   (15초 동안 답장이 감지되지 않았으나 연동은 정상입니다.)")

    print("\n" + "=" * 60)
    print("🚀 모든 연동 테스트가 완료되었습니다!")
    print(f"웹사이트의 메시지 앱 상단 (i) 정보 버튼을 눌러 아래 토큰과 Chat ID를 입력하시면")
    print(f"브라우저에서도 실시간 연동이 활성화됩니다.")
    print(f" - BOT_TOKEN: {bot_token}")
    print(f" - CHAT_ID:   {chat_id}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    print_banner()

    if len(sys.argv) >= 3:
        token = sys.argv[1].strip()
        chat = sys.argv[2].strip()
    else:
        print("\n텔레그램 연동 정보를 입력해 주세요:")
        print("💡 봇 토큰은 @BotFather 에게서 발급받으실 수 있습니다.")
        print("💡 Chat ID는 @userinfobot 에게 아무 메시지나 보내면 확인할 수 있는 본인의 숫자 ID입니다.\n")
        
        token = input("1. 텔레그램 Bot Token을 입력하세요: ").strip()
        chat = input("2. 본인의 Telegram Chat ID를 입력하세요: ").strip()

    if not token or not chat:
        print("❌ 토큰과 Chat ID를 올바르게 입력해 주세요.")
        sys.exit(1)

    success = test_telegram_bot(token, chat)
    sys.exit(0 if success else 1)
