const CustomOWMIconLabelPlugin: any = {
  id: 'custom_OWM_icon_label',
  iconSize: 36,
  iconPadding: -4,
  xOffset: 0,
  yOffset: 0,
  circleColor: '#91a9b8',
  afterDatasetsDraw(chart: any, args: any, options: any): void {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) {
      return;
    }
    const meta = chart.getDatasetMeta(0); // render weather icon at datasets[0]
    const rawData = data.datasets[0].data;

    const { iconSize, iconPadding, xOffset, yOffset, circleColor } = this;
    meta.data.forEach((metaData: any, i: number) => {
      const { x, y } = metaData;
      const { icon, desc } = rawData[i];
      const prevIcon = i === 0 ? '' : rawData[i - 1].icon;
      if (icon !== prevIcon) {
        if (!rawData[i].image) {
          const image = new Image(iconSize, iconSize);
          image.alt = desc;
          image.crossOrigin = 'anonymous';
          image.src = `https://openweathermap.org/img/wn/${icon}.png`;
          rawData[i].image = image;
          rawData[i].image.onload = drawIcon(ctx, x, y, image);
        }
        drawCircle(ctx, x, y);
        if (rawData[i].image.complete) {
          drawIcon(ctx, x, y, rawData[i].image);
        }
      }
    })
    function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number): void {
      ctx.restore();
      ctx.strokeStyle = circleColor;
      ctx.fillStyle = circleColor;
      ctx.beginPath();
      ctx.arc(x - xOffset, y - yOffset, (iconSize / 2) + iconPadding, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.fill();
    }
    function drawIcon(ctx: CanvasRenderingContext2D, x: number, y: number, iconImg: HTMLImageElement): void {
      ctx.restore();
      ctx.drawImage(
        iconImg,
        x - (iconSize / 2) - xOffset,
        y - (iconSize / 2) - yOffset,
        iconSize,
        iconSize
      );
    }
  }
};

export default CustomOWMIconLabelPlugin;