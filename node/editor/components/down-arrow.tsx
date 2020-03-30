
interface Props {
  fill: string
  stroke: string
  size: number
}

export default (props: Props) => {
  const size = props.size
  const u = {
    x: 0,
    y: 0.166 * size
  }
  const v = {
    x: size,
    y: 0.166 * size
  }
  const w = {
    x: size / 2,
    y: (0.66 + 0.166) * size
  }

  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <polygon points={`${u.x}, ${u.y} ${v.x}, ${v.y} ${w.x}, ${w.y}`} fill={props.fill} stroke={props.stroke} />
  </svg>
}