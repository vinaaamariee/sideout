import { createSeedClient } from "@snaplet/seed";
import config from "./seed.config";

async function main() {
  const seed = await createSeedClient(config);

  // This clears existing teams and creates 2 new ones with players
  await seed.teams([
    {
      name: "Batanes Sharks",
      season: "Season 2026",
      color: "#0047AB",
      players: (x: any) => x(5), // Generates 5 players for this team
    },
    {
      name: "Iraya Spikers",
      season: "Season 2026",
      color: "#FF4500",
      players: (x: any) => x(4),
    }
  ]);

  console.log("Database seeded! 🏐");
  process.exit();
}

main();