export const Ayat = ({ data, setSpanRef, index }) => {
  return (
    <span ref={(el) => setSpanRef(el, index)}>
      {data.ayat} <span>﴿{data.uuid}﴾</span>{" "}
    </span>
  );
};
