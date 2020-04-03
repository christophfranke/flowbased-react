
interface Props {
  fill: string
  stroke: string
  size: number
}

export default (props: Props) => {
  const size = props.size
  const u = {
    x: 0,
    y: 0
  }
  const v = {
    x: 0,
    y: size
  }
  const w = {
    x: size / 1.5,
    y: size / 2
  }

  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    <polygon points={`${u.x}, ${u.y} ${v.x}, ${v.y} ${w.x}, ${w.y}`} fill={props.fill} stroke={props.stroke}strokeWidth="2" />
  </svg>
}