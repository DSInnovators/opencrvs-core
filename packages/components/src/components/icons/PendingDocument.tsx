import * as React from 'react'

export const PendingDocument = (props: React.HTMLAttributes<SVGElement>) => (
  <svg
    width={69}
    height={83}
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <title>30B36202-CE78-4451-84B4-C0A4C4E87F03</title>
    <defs>
      <linearGradient x1="50%" y1="95.936%" x2="50%" y2="3%" id="a">
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
      <linearGradient x1="3.532%" y1="49.468%" x2="96.468%" y2="49.468%" id="b">
        <stop stopColor="#4C68C1" offset="0%" />
        <stop stopColor="#B0C8F1" offset="100%" />
      </linearGradient>
      <circle id="d" cx={15} cy={15} r={15} />
      <filter
        x="-35%"
        y="-35%"
        width="170%"
        height="170%"
        filterUnits="objectBoundingBox"
        id="c"
      >
        <feMorphology
          radius={0.5}
          operator="dilate"
          in="SourceAlpha"
          result="shadowSpreadOuter1"
        />
        <feOffset in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
        <feGaussianBlur
          stdDeviation={3}
          in="shadowOffsetOuter1"
          result="shadowBlurOuter1"
        />
        <feColorMatrix
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.114639946 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g transform="translate(0 7)" fill="none" fillRule="evenodd">
      <rect
        stroke="url(#a)"
        strokeWidth={2}
        fill="#FFF"
        fillRule="nonzero"
        x={1}
        y={23}
        width={38}
        height={52}
        rx={1}
      />
      <g transform="translate(4 18)" fillRule="nonzero" strokeWidth={2}>
        <rect
          stroke="url(#a)"
          fill="#FFF"
          x={1}
          y={1}
          width={38}
          height={52}
          rx={1}
        />
        <path
          d="M7.5 13.5H32M7.5 31.5H32M7.5 22.5H32M7.5 40.5H32M7.5 9.5H13M7.5 27.5H13M7.5 18.5H13M7.5 36.5H13"
          stroke="url(#b)"
          strokeLinecap="round"
        />
      </g>
      <g transform="translate(32)">
        <use fill="#000" filter="url(#c)" xlinkHref="#d" />
        <use fill="#E7A449" xlinkHref="#d" />
      </g>
      <g transform="translate(40 10)">
        <path
          d="M11.667 5.143c-2.578-2.286-6.756-2.286-9.334 0M14 2.57c-3.866-3.428-10.134-3.428-14 0m9.333 5.143c-1.288-1.143-3.378-1.143-4.666 0"
          stroke="#FFF"
          strokeWidth={1.597}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse
          fill="#FFF"
          fillRule="nonzero"
          cx={7}
          cy={10.714}
          rx={1.167}
          ry={1.286}
        />
      </g>
    </g>
  </svg>
)
