/** Original vector artwork, inspired by Edwardian maritime engravings. */
export function AnchorMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="20" cy="8" r="4" />
        <path d="M20 12v30M11 19h18M5 29c0 8 6 12 15 15 9-3 15-7 15-15M2 33l3-5 5 3M30 31l5-3 3 5" />
      </g>
    </svg>
  );
}

export function ShipIllustration() {
  return (
    <svg
      className="ship-illustration"
      viewBox="0 0 760 380"
      role="img"
      aria-labelledby="ship-title ship-description"
    >
      <title id="ship-title">RMS Titanic, an illustrated ocean liner</title>
      <desc id="ship-description">
        An original brass-colored line drawing of a four-funnel ocean liner,
        with rigging, portholes, and a compass rose.
      </desc>
      <defs>
        <pattern
          id="hull-hatching"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(28)"
        >
          <path d="M0 0v6" stroke="#cbb885" strokeWidth=".7" opacity=".24" />
        </pattern>
        <linearGradient id="ship-fade" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#eee0b8" />
          <stop offset="1" stopColor="#a99870" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="#b9a779" opacity=".18" strokeWidth=".8">
        <circle cx="426" cy="180" r="151" />
        <circle cx="426" cy="180" r="137" strokeDasharray="2 7" />
        <path d="M426 10v320M248 180h356M285 40l281 281M285 321 566 40" />
      </g>
      <g
        transform="translate(666 72)"
        stroke="#c5b180"
        fill="none"
        opacity=".65"
      >
        <circle r="26" strokeWidth=".7" />
        <circle r="19" strokeWidth=".5" />
        <path
          d="M0-38v76M-38 0h76M-21-21l42 42M-21 21l42-42"
          strokeWidth=".6"
        />
        <path
          d="M0-31 5-5 0 0-5 5ZM31 0 5 5 0 0-5-5ZM0 31-5 5 0 0 5-5ZM-31 0-5-5 0 0 5 5Z"
          fill="#c5b180"
          strokeWidth=".5"
        />
        <text
          x="0"
          y="-44"
          textAnchor="middle"
          fill="#c5b180"
          stroke="none"
          fontSize="10"
          fontFamily="Georgia, serif"
        >
          N
        </text>
      </g>
      <g stroke="url(#ship-fade)" strokeLinejoin="round" fill="none">
        {/* Rigging and the two masts. */}
        <g strokeWidth=".85" opacity=".8">
          <path d="M162 83v170M160 85l-62 154M163 86l95 144M610 95v151M610 99l-101 132M610 100l70 146M161 114h450M164 125h443" />
          <path d="M163 84v-8M610 95v-9M147 138h30M596 148h27M163 91l16 4-16 6M610 101l22 3-22 6" />
          <path d="M45 247v-15M43 232l20 3-20 8M709 223v-19M709 205l18 3-18 7" />
        </g>
        {/* Four distinctive funnels and their stays. */}
        {[270, 350, 430, 510].map((x) => (
          <g key={x}>
            <path
              d={`M${x - 5} 210l-6-63h29l8 63`}
              fill="#a99870"
              fillOpacity=".16"
              strokeWidth="1.2"
            />
            <path
              d={`M${x - 11} 147l-2-13h29l2 13Z`}
              fill="#cbb885"
              fillOpacity=".4"
            />
            <path
              d={`M${x - 4} 153l4 51m7-51 5 51M${x - 10} 148l-26 64M${x + 19} 148l31 63`}
              strokeWidth=".6"
              opacity=".65"
            />
            <path
              d={`M${x - 4} 130c-15-9-33-4-47-13s-31-7-48-15M${x + 10} 124c-23-14-38-9-56-19`}
              strokeWidth=".8"
              opacity=".22"
            />
          </g>
        ))}
        {/* Superstructure, bridge, lifeboats, and promenade decks. */}
        <path
          d="M113 244v-13h71v-14h50v-9h303v10h62v9h37v17"
          fill="#cbb885"
          fillOpacity=".06"
          strokeWidth="1.4"
        />
        <path
          d="M154 230h461M184 218h389M115 241h543M220 208v-8h322v8"
          strokeWidth=".85"
        />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M${194 + i * 13} 221v6m-2-6h4`} strokeWidth="1.4" />
        ))}
        {Array.from({ length: 39 }, (_, i) => (
          <path key={i} d={`M${140 + i * 13} 234h5v4h-5Z`} strokeWidth=".6" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <path
              d={`M${214 + i * 42} 204h27l-5 5h-17Z`}
              fill="#d0be93"
              fillOpacity=".5"
              strokeWidth=".8"
            />
            <path d={`M${216 + i * 42} 203v-6m22 6v-6`} strokeWidth=".7" />
          </g>
        ))}
        {/* Hull: raised bow, long sheer line, and engraved plating. */}
        <path
          d="M43 244h91v3h491l86-16-25 48-42 15H107l-38-16Z"
          fill="#0c2630"
          strokeWidth="1.7"
        />
        <path
          d="M43 244h91v3h491l86-16-25 48-42 15H107l-38-16Z"
          fill="url(#hull-hatching)"
          strokeWidth=".6"
        />
        <path
          d="M51 253h574l80-15M68 277h615M82 284h585M135 247v-5h490v5"
          strokeWidth=".8"
        />
        {Array.from({ length: 44 }, (_, i) => (
          <circle
            key={i}
            cx={104 + i * 12}
            cy={261}
            r="1.55"
            fill="#d1c093"
            stroke="none"
          />
        ))}
        {Array.from({ length: 38 }, (_, i) => (
          <circle
            key={i}
            cx={135 + i * 13}
            cy={270}
            r="1"
            fill="#d1c093"
            stroke="none"
            opacity=".75"
          />
        ))}
        {Array.from({ length: 45 }, (_, i) => (
          <path key={i} d={`M${140 + i * 11} 241v6`} strokeWidth=".55" />
        ))}
        <path d="M673 246v20m-4-5 4 5 4-5M677 251h-8" strokeWidth=".9" />
        <g opacity=".4" strokeWidth=".65">
          <path d="M31 297c67-5 91 6 168 0s150-2 225 0 176-7 288-4M52 305c107-5 163 5 262 0s170 2 260-1 117-5 160-4M113 314c85-4 131 2 209-1s170 1 227-2 87-2 125-2M200 322h62m27-1h85m34-2h106m28-1h58" />
        </g>
      </g>
      <g fill="#c4b284" fontFamily="Georgia, serif" textAnchor="middle">
        <text x="385" y="356" fontSize="12" letterSpacing="5">
          R.M.S. TITANIC
        </text>
        <text x="385" y="373" fontSize="8" letterSpacing="2.4" opacity=".65">
          A VOYAGE INTO THE RECORDS
        </text>
      </g>
    </svg>
  );
}
