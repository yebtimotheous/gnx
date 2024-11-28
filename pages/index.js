import HeroSection from "../components/HeroSection";
import TrendingCollections from "../components/TrendingCollections";
import TopCreators from "../components/TopCreators";
import UpcomingDrops from "../components/UpcomingDrops";
import NFTGallery from "../components/NFTGallery";
import CommunitySection from "../components/CommunitySection";

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-20">
      <section className="section">
        <HeroSection />
      </section>

      <section className="section">
        <NFTGallery />
      </section>

      <section className="section">
        <TrendingCollections />
      </section>

      <section className="section">
        <TopCreators />
      </section>

      <section className="section">
        <UpcomingDrops />
      </section>

      <section className="section">
        <CommunitySection />
      </section>
    </div>
  );
}
