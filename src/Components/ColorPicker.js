import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';

function* hueListGenerator(divided) {
  const interval = Math.floor(360 / divided);
  for (let hue = 0; hue <= (360 - interval); hue += interval) {
    yield hue;
  }
}
const themes = [...hueListGenerator(12)];

const changeTheme = (hue) => {
  const root = document.documentElement;
  root.style.setProperty('--themeHue', hue);
};

const ColorPicker = (props) => {
  useEffect(() => {
    const overlay = document.querySelector('#colorPickerOverlay');
    const clickListener = () => {
      props.closeColorPicker();
    };
    overlay.addEventListener('click', clickListener);
    return () => {
      overlay.removeEventListener('click', clickListener);
    }
  }, [props.show]);

  const themeBtns = themes.map((hue, idx) => (
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
  ));

  return (
    <div>
      <div
        id="colorPickerOverlay"
        className="overlay"
        hidden={!props.show}
      ></div>
      <div
        id="colorPicker"
        className={props.show ? 'show' : null}
      >{themeBtns}
      </div>
    </div>
  );
};

ColorPicker.propTypes = {
  show: PropTypes.bool,
  closeColorPicker: PropTypes.func,
}

export default memo(ColorPicker, (prevProps, nextProps) =>
  prevProps.show === nextProps.show
);