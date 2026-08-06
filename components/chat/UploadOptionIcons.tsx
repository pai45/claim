type UploadOptionIconProps = {
  size?: number;
};

export function CameraMinimalisticIcon({ size = 24 }: UploadOptionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="13" r="3" stroke="#003434" strokeWidth="1.5" />
      <path
        d="M10.0001 19.9999H14.0001C16.809 19.9999 18.2135 19.9999 19.2224 19.3258C19.6591 19.0339 20.0341 18.6589 20.326 18.2222C21.0001 17.2133 21.0001 15.8088 21.0001 12.9999C21.0001 10.191 21 8.78673 20.3258 7.77783C20.034 7.34107 19.659 6.96607 19.2222 6.67423C18.2133 6.00011 16.8089 6.00011 14 6.00011H9.99995C7.19103 6.00011 5.78656 6.00011 4.77767 6.67423C4.34091 6.96607 3.96591 7.34107 3.67407 7.77783C3.0001 8.7865 3.0001 10.1903 3.0001 12.998L3.0001 12.9999C3.0001 15.8088 3.0001 17.2133 3.67422 18.2222C3.96605 18.6589 4.34106 19.0339 4.77782 19.3258C5.78671 19.9999 7.19117 19.9999 10.0001 19.9999Z"
        stroke="#003434"
        strokeWidth="1.5"
      />
      <path d="M18 10H17.5" stroke="#003434" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.5 3.5H9.5" stroke="#003434" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function GalleryMinimalisticIcon({ size = 24 }: UploadOptionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
        stroke="#003434"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="8" r="2" stroke="#003434" strokeWidth="1.5" />
      <path
        d="M5 13.3051L5.81051 12.5523C6.73658 11.6921 8.18321 11.7404 9.04988 12.6604L11.6974 15.4707C12.2356 16.042 13.1166 16.119 13.7457 15.6496C14.6522 14.9734 15.9144 15.0502 16.7322 15.8315L19 17.9981"
        stroke="#003434"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UploadSquareIcon({ size = 24 }: UploadOptionIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 17L12 10M9 13L12 10L15 13"
        stroke="#003434"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 7H12H8" stroke="#003434" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
        stroke="#003434"
        strokeWidth="1.5"
      />
    </svg>
  );
}
