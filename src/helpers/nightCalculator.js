"use strict";

module.exports = (doc, body) => {
  const lateDeptNightTurn = 1000 * 60 * 60 * 18;
  const ref = doc || body; // body varsa body'yi, yoksa doc'u refere et
  const totalTime = ref.departure_date.getTime() - ref.arrival_date.getTime();
  const isEligibleToLateDept = totalTime > lateDeptNightTurn; // 18 saatten fazla kalma durumu
  const nightCalculation = Math.ceil(totalTime / (1000 * 60 * 60 * 24));

  const target = body || doc; // body varsa body'yi, yoksa doc'u kullan
  target.night =
    ref.departure_date.getHours() > 14 && isEligibleToLateDept
      ? nightCalculation + 0.5
      : nightCalculation;
};
