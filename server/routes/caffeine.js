const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const {
  calculateRemainingCaffeine,
  assessSleepRisk,
  calculateCutoffTime,
} = require('../services/calcCaffeine');

const RECORDS_PATH = path.join(__dirname, '../../data/records.json');

// GET /api/caffeine/status?bedtime=23:00
router.get('/status', (req, res) => {
  const bedtime = req.query.bedtime || '23:00';
  let records = [];

  // records.json이 존재하고 내용이 있으면 읽고, 없으면 테스트용 기본 데이터 사용
  if (fs.existsSync(RECORDS_PATH)) {
    try {
      const raw = fs.readFileSync(RECORDS_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        records = parsed;
      }
    } catch (e) {
      records = [];
    }
  }

  // 아직 B가 데이터를 넣기 전이라도 테스트할 수 있도록 임시 데이터 제공
  if (records.length === 0) {
    records = [
      { drinkName: '아메리카노 (테스트)', caffeineMg: 150, intakeTime: '18:00' },
    ];
  }

  const now = new Date();
  const currentRemaining = calculateRemainingCaffeine(records, now);
  const risk = assessSleepRisk(records, bedtime, now);
  const cutoffTime = calculateCutoffTime(bedtime);

  res.json({
    currentRemaining,
    bedtimeRemaining: risk.bedtimeRemaining,
    riskLevel: risk.level,
    riskLabel: risk.label,
    cutoffTime,
  });
});

module.exports = router;
