import React, { Fragment, memo } from 'react';
import styles from './ColorPicker.module.scss'

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
  const ThemeButtons = () => (
    <Fragment>{themes.map((hue, idx) => (
      <div
        key={idx}
        className={styles.themeBtnWrapper}
      >
        <button
          onClick={() => changeTheme(hue)}
          style={{ backgroundColor: `hsl(${hue}, 50%, 30%)` }}
          className={styles.themeBtn}
        >
        </button>
      </div>
    ))}
    </Fragment>
  );

  const overlayClickHandler = (): void => {
    props.closeColorPicker();
  };

  return (
    <div>
      <div
        className="overlay"
        hidden={!props.show}
        onClick={overlayClickHandler}
      ></div>
      <div className={styles.colorPicker + `${props.show ? ' show' : ''}`}>
        <ThemeButtons />
      </div>
    </div>
  );
};

export default memo(ColorPicker, (prevProps, nextProps) =>
  prevProps.show === nextProps.show
);