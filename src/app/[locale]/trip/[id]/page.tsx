import { Metadata } from 'next';
import * as db from '@/lib/db';
import TripClientPage from './TripClientPage';

interface TripPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: TripPageProps): Promise<Metadata> {
  const { id, locale } = await params;

  try {
    const trip = await db.getTrip(id);
    if (trip && trip.title) {
      const description = `${trip.destination} travel itinerary - ${trip.travelers || ''} ${trip.theme || ''}`.trim();
      return {
        title: `${trip.title} | TripTalk`,
        description,
        keywords: [
          trip.destination,
          `${trip.destination} travel`,
          trip.theme,
          'AI travel planner',
          'TripTalk',
        ].filter(Boolean) as string[],
        openGraph: {
          title: `${trip.title} | TripTalk`,
          description: `${trip.destination} travel itinerary`,
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${trip.title} | TripTalk`,
          description: `${trip.destination} travel itinerary`,
        },
        alternates: {
          canonical: `/${locale}/trip/${id}`,
        },
      };
    }
  } catch {
    // Fall through to defaults
  }

  return {
    title: 'Travel Itinerary | TripTalk',
    description: 'Check out this travel itinerary made with TripTalk!',
  };
}

async function getTripJsonLd(id: string) {
  try {
    const itinerary = await db.getItinerary(id);
    if (!itinerary) return null;

    const { trip, days } = itinerary;
    const jsonLd: Record<string, unknown>[] = [];

    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'TravelAction',
      name: trip.title || 'Travel Itinerary',
      description: `${trip.destination} travel itinerary`,
      toLocation: {
        '@type': 'Place',
        name: trip.destination,
      },
      ...(trip.startDate && { startTime: trip.startDate }),
      ...(trip.endDate && { endTime: trip.endDate }),
    });

    const allPlaces = days.flatMap((d) => d.places);
    if (allPlaces.length > 0) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${trip.title || trip.destination} travel places`,
        numberOfItems: allPlaces.length,
        itemListElement: allPlaces.map((place, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'TouristAttraction',
            name: place.name,
            description: place.description,
            ...(place.address && { address: place.address }),
            ...(place.latitude && place.longitude && {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: place.latitude,
                longitude: place.longitude,
              },
            }),
            ...(place.rating && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: place.rating,
                bestRating: 5,
              },
            }),
          },
        })),
      });
    }

    return jsonLd;
  } catch {
    return null;
  }
}

export default async function TripPage({ params }: TripPageProps) {
  const { id } = await params;
  const jsonLd = await getTripJsonLd(id);

  return (
    <>
      {jsonLd && jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <TripClientPage tripId={id} />
    </>
  );
}
