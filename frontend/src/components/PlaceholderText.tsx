import classNames from "classnames";

export default function PlaceholderText(props: {
  rows?: number;
  className?: string;
  characterLength?: number;
}) {
  return (
    <span
      className={classNames("bg-slate-400 text-slate-400", props.className)}
    >
      {"Loading".padEnd(Math.max((props.characterLength || 7) - 7, 0), " ")}
    </span>
  );
}
