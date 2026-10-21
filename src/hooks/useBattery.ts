import { useState, useEffect } from 'react';

export interface BatteryData {
  macbook: number;
  isCharging: boolean;
  airpods: number;
  mouse: number;
}

export function useBattery(): BatteryData {
  // 에어팟과 마우스는 세션 단위로 일관성 있게 70%~95% 사이의 자연스러운 랜덤값 생성
  const [accessories] = useState(() => {
    const savedAirpods = sessionStorage.getItem('battery_airpods');
    const savedMouse = sessionStorage.getItem('battery_mouse');

    const airpodsVal = savedAirpods
      ? parseInt(savedAirpods, 10)
      : Math.floor(Math.random() * 26) + 70; // 70~95%

    const mouseVal = savedMouse
      ? parseInt(savedMouse, 10)
      : Math.floor(Math.random() * 21) + 75; // 75~95%

    sessionStorage.setItem('battery_airpods', airpodsVal.toString());
    sessionStorage.setItem('battery_mouse', mouseVal.toString());

    return { airpods: airpodsVal, mouse: mouseVal };
  });

  const [macbookBattery, setMacbookBattery] = useState({
    percent: 100,
    isCharging: false,
  });

  useEffect(() => {
    let batteryInstance: any = null;

    const updateBattery = (battery: any) => {
      setMacbookBattery({
        percent: Math.round(battery.level * 100),
        isCharging: battery.charging,
      });
    };

    // Web Battery API 지원 여부 확인 (Chromium, Edge, Whale 등)
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          batteryInstance = battery;
          updateBattery(battery);

          battery.addEventListener('levelchange', () => updateBattery(battery));
          battery.addEventListener('chargingchange', () => updateBattery(battery));
        })
        .catch(() => {
          // 데스크톱 PC이거나 권한 없을 시 기본 100%
          setMacbookBattery({ percent: 100, isCharging: false });
        });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener?.('levelchange', () => {});
        batteryInstance.removeEventListener?.('chargingchange', () => {});
      }
    };
  }, []);

  return {
    macbook: macbookBattery.percent,
    isCharging: macbookBattery.isCharging,
    airpods: accessories.airpods,
    mouse: accessories.mouse,
  };
}
