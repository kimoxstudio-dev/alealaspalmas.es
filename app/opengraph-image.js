import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Alea Las Palmas · Tira, juega, repite.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  const logoBuffer = await readFile(join(process.cwd(), "app", "icon.png"));
  const logoData = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background:
            "radial-gradient(ellipse at 20% 0%, #1d2535 0%, #0a0a12 55%, #050810 100%)",
          color: "#f4ead5",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Patrón hex sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "repeating-linear-gradient(60deg, rgba(200,162,91,0.05) 0 1px, transparent 1px 60px), repeating-linear-gradient(-60deg, rgba(200,162,91,0.05) 0 1px, transparent 1px 60px)",
          }}
        />

        {/* Barra superior */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            zIndex: 1,
          }}
        >
          <img
            src={logoData}
            width={88}
            height={88}
            alt=""
            style={{ borderRadius: 12 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontSize: 44,
                fontWeight: 700,
                letterSpacing: 6,
                color: "#f4ead5",
              }}
            >
              ALEA
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#c8a25b",
                letterSpacing: 4,
                textTransform: "uppercase",
              }}
            >
              Las Palmas
            </span>
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              border: "1px solid rgba(200,162,91,0.55)",
              borderRadius: 999,
              color: "#e6c281",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 2,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#e6c281",
              }}
            />
            ABIERTO 24/7
          </div>
        </div>

        {/* Bloque central — título grande */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: "#c8a25b",
              letterSpacing: 6,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Asociación Cultural y Social
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              fontSize: 124,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            <span style={{ color: "#e6c281" }}>Tira</span>
            <span style={{ color: "#f4ead5" }}>, juega,</span>
          </div>
          <div
            style={{
              fontSize: 124,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: -3,
              color: "#f4ead5",
              fontStyle: "italic",
            }}
          >
            repite.
          </div>
          <span
            style={{
              fontSize: 28,
              color: "rgba(244,234,213,0.75)",
              maxWidth: 900,
              marginTop: 12,
            }}
          >
            Juegos de rol, mesa, wargames y miniaturas en Las Palmas de Gran Canaria.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
            color: "rgba(244,234,213,0.6)",
            fontSize: 22,
            letterSpacing: 1,
          }}
        >
          <span>alealaspalmas.es</span>
          <div style={{ display: "flex", gap: 32 }}>
            <span>60+ eventos / año</span>
            <span style={{ color: "#c8a25b" }}>·</span>
            <span>350+ juegos</span>
            <span style={{ color: "#c8a25b" }}>·</span>
            <span>20+ tiendas aliadas</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
