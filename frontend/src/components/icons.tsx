import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const Icons = {
  copy: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  send: (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.51002 4.23001L18.07 8.51001C21.91 10.43 21.91 13.57 18.07 15.49L9.51002 19.77C3.75002 22.65 1.40002 20.29 4.28002 14.54L5.15002 12.81C5.37002 12.37 5.37002 11.64 5.15002 11.2L4.28002 9.46001C1.40002 3.71001 3.76002 1.35001 9.51002 4.23001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.44 12H10.84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  clearpath: (props: IconProps) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8.5H17" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12H14" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 15.5H11" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  check: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  warning: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 21.41H5.94C2.47 21.41 1.02 18.93 2.7 15.9L5.82 10.28L8.76 5.00003C10.54 1.79003 13.46 1.79003 15.24 5.00003L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.995 17H12.004" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  sun: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2V4M12 20V22M4 12H2M22 12H20M19.778 4.222L17.556 6.444M6.444 17.556L4.222 19.778M19.778 19.778L17.556 17.556M6.444 6.444L4.222 4.222" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),

  moon: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.53 15.93C21.37 15.66 20.93 15.56 20.63 15.61C19.64 15.84 18.56 15.82 17.5 15.51C15.26 14.84 13.58 12.94 13.16 10.69C12.89 9.23001 13.15 7.83001 13.82 6.64001C14.05 6.21001 13.92 5.83001 13.76 5.63001C13.6 5.42001 13.22 5.22001 12.72 5.39001C8.79 6.85001 6.52 10.87 7.35 14.99C8.06 18.48 11.12 21.17 14.65 21.46C15.34 21.52 16.04 21.48 16.71 21.35C18.53 20.99 20.08 20.05 21.21 18.72C21.52 18.36 21.69 18.19 21.53 15.93Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  chevronDown: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  panel: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  loader: (props: IconProps) => (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default Icons;
