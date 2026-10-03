import { useEffect, useRef } from "react";
import Phaser from "phaser";
import type { SimulationSnapshot, StreetScenario } from "./types.ts";

type Props = {
  world: StreetScenario;
  snapshot: SimulationSnapshot;
  previous: SimulationSnapshot;
  selected: string;
  running: boolean;
  showCatchments: boolean;
  onSelect: (id: string) => void;
};
const colors = {
  roof: 0xd1c7b5,
  paving: 0xe6e1d5,
  asphalt: 0x626c70,
  "vegetated-soil": 0x87aa83,
};
const px = (x: number) => 30 + x * 14;
const py = (y: number) => 38 + y * 14;

// One scene; it consumes model and simulation output. It never changes either.
export function WorldView(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const current = useRef(props);
  current.current = props;
  useEffect(() => {
    let last: Props | undefined;
    let overlay: Phaser.GameObjects.Graphics;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    class StreetScene extends Phaser.Scene {
      constructor() {
        super("StreetScene");
      }
      create() {
        this.drawWorld();
      }
      drawWorld() {
        this.children.removeAll(true);
        const { world, snapshot, selected } = current.current;
        const g = this.add.graphics();
        const label = (
          x: number,
          y: number,
          value: string,
          color = "#243b3b",
          size = 13,
        ) =>
          this.add.text(x, y, value, {
            fontFamily: "Arial, sans-serif",
            fontSize: size,
            color,
          });
        world.zones.forEach((z) => {
          const material = world.surfaces.find(
            (s) => s.zoneId === z.id,
          )!.material;
          const r = z.rect;
          g.fillStyle(colors[material]).fillRect(
            px(r.x),
            py(r.y),
            r.width * 14,
            r.height * 14 - 2,
          );
          if (z.kind === "building") {
            for (let i = 0; i < 6; i++) {
              const x = px(3 + i * 6);
              g.fillStyle(0xbcb4a5).fillRect(x, py(r.y + 2), 65, 62);
              g.lineStyle(1, 0xf6f2e7, 0.7).strokeRect(
                x + 5,
                py(r.y + 2) + 5,
                55,
                52,
              );
              g.lineBetween(x + 32, py(r.y + 2) + 5, x + 32, py(r.y + 2) + 57);
            }
          }
          if (material === "vegetated-soil") {
            for (let i = 0; i < 12; i++) {
              const x = px(3 + i * 2.2),
                y = py(r.y + 1.2);
              g.fillStyle(0x4f8055).fillCircle(x, y, 5);
              g.fillStyle(0xa9c68c).fillCircle(x + 3, y - 3, 3);
            }
          }
          if (z.kind === "parking" && z.parkingSpaces > 0) {
            for (let i = 0; i < z.parkingSpaces; i++) {
              g.lineStyle(1, 0xc9d0ce, 0.6).strokeRect(
                px(3 + i * 7),
                py(r.y + 0.25),
                80,
                20,
              );
              const carX = px(3 + i * 7) + 12,
                carY = py(r.y + 0.25) + 4;
              g.fillStyle(
                [0xb5c6c2, 0xd0b99d, 0x98aebc][i % 3],
              ).fillRoundedRect(carX, carY, 52, 13, 4);
              g.fillStyle(0x53696e).fillRect(carX + 12, carY + 2, 15, 9);
            }
          }
          if (z.kind === "road") {
            g.lineStyle(2, 0xf2eee1, 0.55);
            for (let x = 2; x < 60; x += 6)
              g.lineBetween(
                px(x),
                py(r.y + r.height / 2),
                px(x + 3),
                py(r.y + r.height / 2),
              );
          }
          const hit = this.add
            .zone(px(r.x), py(r.y), r.width * 14, r.height * 14)
            .setOrigin(0)
            .setInteractive({ useHandCursor: true });
          hit.on("pointerdown", () => current.current.onSelect(z.id));
          if (z.id === selected)
            g.lineStyle(3, 0xf4b544).strokeRect(
              px(r.x) + 2,
              py(r.y) + 2,
              r.width * 14 - 4,
              r.height * 14 - 5,
            );
          label(
            px(1),
            py(r.y) + (z.kind === "parking" ? -14 : 4),
            z.id === "zone-2" && material === "vegetated-soil"
              ? "RAIN GARDEN · former parking"
              : z.label.toUpperCase(),
            material === "asphalt" ? "#ffffff" : "#243b3b",
            11,
          );
        });
        const byId = new Map(world.nodes.map((n) => [n.id, n]));
        world.connections.forEach((e) => {
          const a = byId.get(e.from)!.position,
            b = byId.get(e.to)!.position;
          const catchment = e.id.startsWith("rain-");
          if (catchment && !current.current.showCatchments) return;
          const color =
            e.kind === "overflow"
              ? 0xb97138
              : e.kind === "infiltration"
                ? 0x2b764d
                : 0x235d80;
          g.lineStyle(
            catchment ? 1 : 3,
            color,
            catchment ? 0.25 : 0.85,
          ).lineBetween(px(a.x), py(a.y), px(b.x), py(b.y));
          if (!catchment) {
            const angle = Math.atan2(b.y - a.y, b.x - a.x);
            const x = px(a.x + (b.x - a.x) * 0.72),
              y = py(a.y + (b.y - a.y) * 0.72);
            g.fillStyle(color).fillTriangle(
              x,
              y,
              x - 9 * Math.cos(angle - 0.5),
              y - 9 * Math.sin(angle - 0.5),
              x - 9 * Math.cos(angle + 0.5),
              y - 9 * Math.sin(angle + 0.5),
            );
          }
        });
        world.assets.forEach((a) => {
          const x = px(a.position.x),
            y = py(a.position.y);
          if (a.kind === "rain-garden") {
            g.fillStyle(0x366943).fillRoundedRect(x - 44, y - 9, 88, 20, 5);
            const node = world.nodes.find((n) => n.id === a.nodeId)!;
            const fraction =
              node.kind === "storage" && node.capacityM3 > 0
                ? (snapshot.nodeStorage[a.nodeId] ?? 0) / node.capacityM3
                : 0;
            g.fillStyle(0x65bee0, 0.9).fillRoundedRect(
              x - 40,
              y - 5,
              80 * fraction,
              12,
              3,
            );
          } else {
            g.fillStyle(0x273f40).fillRoundedRect(x - 9, y - 9, 18, 18, 3);
            g.lineStyle(2, 0xffffff, 0.7).lineBetween(x - 5, y, x + 5, y);
          }
        });
        world.nodes
          .filter((n) => n.kind !== "catchment")
          .forEach((n) => {
            if (!world.assets.some((a) => a.nodeId === n.id))
              g.fillStyle(n.kind === "soil" ? 0x447653 : 0x244e64).fillCircle(
                px(n.position.x),
                py(n.position.y),
                6,
              );
            const badge = label(
              px(n.position.x) - 28,
              py(n.position.y) + 15,
              n.label,
              "#173f46",
              13,
            );
            badge.setBackgroundColor("#f5f4ef").setPadding(4, 2, 4, 2);
          });
        label(
          30,
          480,
          "PLAN VIEW  /  60 × 30 m illustrative block",
          "#687778",
          12,
        );
        overlay = this.add.graphics();
        last = current.current;
      }
      update(time: number) {
        if (last !== current.current) this.drawWorld();
        overlay.clear();
        const { world, snapshot, previous, running } = current.current;
        if (!running || reducedMotion) return;
        overlay.lineStyle(1, 0x3284a8, 0.35);
        for (let i = 0; i < 45; i++) {
          const x = 35 + ((i * 97) % 830),
            y = 40 + ((time * 0.12 + i * 67) % 410);
          overlay.lineBetween(x, y, x - 3, y + 10);
        }
        world.connections.forEach((e, i) => {
          if (e.id.startsWith("rain-") && !current.current.showCatchments)
            return;
          if (
            (snapshot.edgeVolumes[e.id] ?? 0) -
              (previous.edgeVolumes[e.id] ?? 0) <=
            1e-9
          )
            return;
          const a = world.nodes.find((n) => n.id === e.from)!.position;
          const b = world.nodes.find((n) => n.id === e.to)!.position;
          const t = (time / 1600 + i * 0.13) % 1;
          overlay
            .fillStyle(e.kind === "overflow" ? 0xf0b56d : 0x99e2fa)
            .fillCircle(
              px(a.x + (b.x - a.x) * t),
              py(a.y + (b.y - a.y) * t),
              4,
            );
        });
      }
    }
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      width: 900,
      height: 510,
      backgroundColor: "#f5f4ef",
      scene: [StreetScene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      banner: false,
    });
    return () => game.destroy(true);
  }, []);
  return (
    <div
      className="world"
      ref={host}
      role="img"
      aria-label="Interactive schematic street. Use the zone buttons below for keyboard access. Blue arrows are drainage connections, green arrows infiltration, and amber arrows overflow."
    />
  );
}
