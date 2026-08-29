import { useTranslation } from 'react-i18next';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export type TestimonialItem = {
  key: string;
  initials: string;
  name: string;
};

type TestimonialCarouselProps = {
  items: readonly TestimonialItem[];
};

export const TestimonialCarousel = ({ items }: TestimonialCarouselProps) => {
  const { t } = useTranslation('home');

  return (
    <Carousel
      className="testi-carousel reveal"
      opts={{ align: 'start' }}
      aria-label={t('testimonials.title')}
    >
      <CarouselContent className="-ml-6">
        {items.map((item) => (
          <CarouselItem
            key={item.key}
            className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
          >
            <article className="testi">
              <p className="testi-quote">{t(`testimonials.${item.key}.quote`)}</p>
              <div className="testi-who">
                <div className="testi-avatar">{item.initials}</div>
                <div>
                  <div className="testi-name">{item.name}</div>
                  <div className="testi-role">{t(`testimonials.${item.key}.role`)}</div>
                </div>
              </div>
            </article>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="testi-nav">
        <CarouselPrevious
          className="static translate-none"
          aria-label={t('testimonials.prev')}
        />
        <CarouselNext
          className="static translate-none"
          aria-label={t('testimonials.next')}
        />
      </div>
    </Carousel>
  );
};
