export const Ayat = ({ data, setSpanRef, index }) => {
  return (
    <>
      {data.surahStart && <div>Heading</div>}
      <span
        ref={(el) => setSpanRef(el, index)}
        id={data.surahStart ? `4` : undefined}
      >
        {data.ayat}{" "}
        <span style={{ backgroundColor: "red" }}>﴿{data.uuid}﴾</span>{" "}
      </span>
    </>
  );
};
