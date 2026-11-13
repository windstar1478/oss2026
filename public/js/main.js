document.addEventListener('DOMContentLoaded', () => {
  const bedtimeInput = document.getElementById('target-bedtime-input');
  const applyBedtimeBtn = document.getElementById('apply-bedtime-btn');

  // 화면을 최신 잔여 카페인 상태로 업데이트하는 함수
  window.updateCaffeineStatus = async function () {
    const bedtime = bedtimeInput ? bedtimeInput.value : '23:00';

    try {
      const response = await fetch(`/api/caffeine/status?bedtime=${encodeURIComponent(bedtime)}`);
      const data = await response.json();

      // 1. 현재 잔여량 업데이트
      document.getElementById('current-caffeine').textContent = data.currentRemaining;

      // 2. 취침 시 예상 잔여량 업데이트
      document.getElementById('bedtime-caffeine').textContent = data.bedtimeRemaining;

      // 3. 위험도 뱃지 텍스트 & 색상 업데이트
      const badgeEl = document.getElementById('risk-badge');
      badgeEl.textContent = data.riskLabel;

      if (data.riskLevel === 'danger') {
        badgeEl.style.backgroundColor = '#ef4444';
      } else if (data.riskLevel === 'warning') {
        badgeEl.style.backgroundColor = '#f59e0b';
      } else {
        badgeEl.style.backgroundColor = '#10b981';
      }

      // 4. 마지노선 시각 업데이트
      document.getElementById('calc-cutoff-time').textContent = data.cutoffTime;
    } catch (error) {
      console.error('카페인 상태 불러오기 실패:', error);
    }
  };

  // 버튼 클릭 시 재계산 및 시각적 피드백
  if (applyBedtimeBtn) {
    applyBedtimeBtn.addEventListener('click', async () => {
      await window.updateCaffeineStatus();

      // 버튼 텍스트 변경
      const originalText = applyBedtimeBtn.textContent;
      applyBedtimeBtn.textContent = '적용됨';
      setTimeout(() => {
        applyBedtimeBtn.textContent = originalText;
      }, 1000);
    });
  }

  // 페이지 처음 열릴 때 1회 실행
  window.updateCaffeineStatus();
});
