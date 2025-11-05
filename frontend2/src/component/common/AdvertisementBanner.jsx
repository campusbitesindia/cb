import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

export default function AdvertisementBanner() {
  const ads = [
    "/banner2.jpeg",
    "/banner3.jpeg",
    "/banner4.jpeg",
    "/banner5.jpeg",
  ];

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg mb-6 bg-gray-800 w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
      >
        {ads.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt={`Banner ${i + 1}`}
              className="w-full h-[200px] sm:h-[220px] md:h-[250px] object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
