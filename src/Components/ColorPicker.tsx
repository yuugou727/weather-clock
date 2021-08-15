import React, { Fragment, memo, useEffect } from 'react';

function* hueListGenerator(divided: number) {
  const interval = Math.floor(360 / divided);
  for (let hue = 0; hue <= (360 - interval); hue += interval) {
    yield hue;
  }
}
const themes: number[] = Array.from(hueListGenerator(12));

const changeTheme = (hue: number): void => {
  const root = document.documentElement;
  root.style.setProperty('--themeHue', hue.toString());
};

interface IProps {
  show: boolean | undefined;
  closeColorPicker: () => void;
};

const ColorPicker = (props: IProps) => {
  useEffect(() => {
    const overlay = document.querySelector('#colorPickerOverlay');
    const clickListener = (): void => {
      props.closeColorPicker();
    };
    overlay && overlay.addEventListener('click', clickListener);
    return () => {
      overlay && overlay.removeEventListener('click', clickListener);
    }
  }, [props.show]);

  const ThemeButtons = () => (
    <Fragment>{themes.map((hue, idx) => (
      <div
        key={idx}
        className="themeBtnWrapper"
      >
        <button
          onClick={() => changeTheme(hue)}
          style={{ backgroundColor: `hsl(${hue}, 50%, 30%)` }}
          className="themeBtn"
        >
        </button>
      </div>
    ))}
    </Fragment>
  );

  return (
    <div>
      <div
        id="colorPickerOverlay"
        className="overlay"
        hidden={!props.show}
      ></div>
      <div
        id="colorPicker"
        className={props.show ? 'show' : undefined}
      >
        <ThemeButtons />
      </div>
    </div>
  );
};

export default memo(ColorPicker, (prevProps, nextProps) =>
  prevProps.show === nextProps.show
);