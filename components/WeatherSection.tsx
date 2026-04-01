import { TopicTrends } from "./TopicTrends";

interface WeatherSectionProps {
  weather: string;
  topicTrends?: Record<string, number>;
}

export function WeatherSection({ weather, topicTrends }: WeatherSectionProps) {
  return (
    <section className="mb-10 py-5 px-5 -mx-5 bg-[var(--color-accent-light)] border-y border-[var(--color-accent)]/20">
      <p className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-accent)] mb-2">
        AI Weather
      </p>
      <p className="text-[17px] text-[var(--color-foreground)] leading-relaxed font-medium">
        {weather}
      </p>
      {topicTrends && (
        <div className="mt-4 pt-4 border-t border-[var(--color-accent)]/10">
          <TopicTrends trends={topicTrends} />
        </div>
      )}
    </section>
  );
}
