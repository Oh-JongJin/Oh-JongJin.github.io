#!/usr/bin/env node

/**
 * macOS 포트폴리오 텔레그램 연동 테스트 스크립트 (Node.js 버전)
 */

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('='.repeat(60));
  console.log('🍎 macOS Portfolio - Telegram Notification Test Program (Node.js)');
  console.log('='.repeat(60));

  let token = process.argv[2];
  let chat = process.argv[3];

  if (!token || !chat) {
    console.log('\n텔레그램 연동 정보를 입력해 주세요:');
    console.log('💡 봇 토큰: @BotFather 에서 생성한 HTTP API 토큰');
    console.log('💡 Chat ID: @userinfobot 에서 확인한 본인의 고유 숫자 ID\n');

    token = (await question('1. 텔레그램 Bot Token을 입력하세요: ')).trim();
    chat = (await question('2. 본인의 Telegram Chat ID를 입력하세요: ')).trim();
  }

  if (!token || !chat) {
    console.log('❌ 봇 토큰과 Chat ID를 모두 입력해 주세요.');
    rl.close();
    process.exit(1);
  }

  console.log('\n[1/2] 텔레그램 봇 상태 확인 중...');
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      console.log('❌ 봇 연결 실패:', meData.description);
      rl.close();
      process.exit(1);
    }

    console.log(`✅ 봇 연결 성공: @${meData.result.username} (${meData.result.first_name})`);
  } catch (err) {
    console.log('❌ 네트워크 요청 실패:', err.message);
    rl.close();
    process.exit(1);
  }

  console.log(`\n[2/2] 테스트 메시지 발송 중 (Chat ID: ${chat})...`);
  try {
    const now = new Date().toLocaleString('ko-KR');
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: `🎉 [macOS 포트폴리오 연동 테스트 성공]\n안녕하세요 오종진님!\n포트폴리오 메시지 앱과 텔레그램이 정상적으로 연결되었습니다.\n테스트 시각: ${now}`,
      }),
    });

    const sendData = await sendRes.json();
    if (sendData.ok) {
      console.log('✅ 테스트 메시지 발송 성공!');
      console.log('👉 본인 텔레그램 앱의 봇 채팅방에 알림이 도착했는지 확인해 보세요.');
    } else {
      console.log('❌ 메시지 발송 실패:', sendData.description);
      rl.close();
      process.exit(1);
    }
  } catch (err) {
    console.log('❌ 발송 에러:', err.message);
    rl.close();
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 모든 연동 테스트가 성공적으로 완료되었습니다!');
  console.log('웹사이트 메시지 창 우측 상단 (i) 정보 버튼에서 아래 정보를 입력하시면');
  console.log('실제 웹 방문자가 보낸 메시지를 실시간으로 받으실 수 있습니다.');
  console.log(` - BOT_TOKEN: ${token}`);
  console.log(` - CHAT_ID:   ${chat}`);
  console.log('='.repeat(60) + '\n');

  rl.close();
}

main();
