import { useId } from "react";

const syrupPath = (first: number, second: number, third: number, fourth: number, fifth: number) => `
  M0 0H1200V10
  C1179 22 1152 16 1126 16
  C1099 16 1110 ${fifth} 1088 ${fifth} C1067 ${fifth} 1076 19 1041 17
  C1001 14 982 28 942 22
  C900 15 910 ${fourth} 881 ${fourth} C850 ${fourth} 865 18 818 17
  C769 16 741 29 690 20
  C654 13 669 ${third} 643 ${third} C618 ${third} 628 22 591 21
  C553 20 517 7 471 16
  C430 25 446 ${second} 412 ${second} C377 ${second} 393 17 351 19
  C300 21 278 12 244 15
  C207 19 224 ${first} 199 ${first} C174 ${first} 185 19 150 20
  C110 21 83 27 55 23 C31 20 13 16 0 10Z`;

const resting = syrupPath(42, 65, 32, 54, 38);
const flowing = [resting, syrupPath(63, 44, 54, 72, 42), syrupPath(32, 77, 38, 43, 65), resting].join(";");

export function SyrupEdge({ className, glossy = false }: { className: string; glossy?: boolean }) {
  const gradient = useId();
  const fill = glossy ? `url(#${gradient})` : "currentColor";

  return <svg className={`syrup-edge ${className}`} viewBox="0 0 1200 88" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    {glossy && <defs>
      <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="88">
        <stop stopColor="var(--syrup-start, #4c2822)" />
        <stop offset=".64" stopColor="var(--syrup-middle, #3a1d19)" />
        <stop offset="1" stopColor="var(--syrup-end, #2f1714)" />
      </linearGradient>
    </defs>}
    <path className="syrup-resting" fill={fill} d={resting} />
    <path className="syrup-flowing" fill={fill} d={resting}>
      <animate attributeName="d" values={flowing} dur="6.8s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.34;.68;1" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1" />
    </path>
    {glossy && <path className="syrup-glint" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M68 13q21 1 38-2 M190 21q-3 6-3 10 M400 22q-4 7-4 17 M635 23q-2 3-2 5 M871 22q-4 7-4 12 M1078 21q-2 4-2 7 M1131 11q15 2 28 1" />}
  </svg>;
}
