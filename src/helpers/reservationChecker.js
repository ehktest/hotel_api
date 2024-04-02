"use strict";

module.exports = async (model, req) => {
  const reservationId = req.params?.reservationId;
  const { roomId, arrival_date, departure_date } = req.body;
  // Ayni oda icin diger rezervazyonlarla tarih araligi cakisan rezervasyonlari tespit et
  const existingReservations = await model.find({
    _id: { $ne: reservationId },
    roomId,
    $and: [
      { arrival_date: { $lt: departure_date } },
      { departure_date: { $gt: arrival_date } },
    ],
  });

  // Cakisan rezervasyonlar varsa hata dondur
  return existingReservations.length > 0;
};
