import { memo, useCallback, useEffect, useMemo, useState } from "react";

type ObjectType = {
  id: number;
  name: string;
  count: number;
};
const makeObjects = (): ObjectType[] => {
  const count = 10;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Object ${i}`,
    count: 0,
  }));
};
export function RenderTest() {
  const [objects, setObjects] = useState(makeObjects());

  const length = Object.values(objects).length;

  const counts = useMemo(() => {
    console.log("computing counts");
    const newCounts = Array.from({ length }, (_, i) => i);
    return newCounts;
  }, [length]);

  const onClickObject = useCallback((id: number) => {
    setObjects((prev) => {
      return prev.map((obj) =>
        obj.id === id ? { ...obj, count: obj.count + 1 } : obj,
      );
    });
  }, []);

  useEffect(() => {
    console.log("mounting render test");
  }, []);

  return (
    <div>
      <h1>Render Test</h1>
      <div className="render-list flex flex-wrap gap-6 p-10">
        {counts.map((i) => {
          const object = objects[i];
          if (!object) {
            return null;
          }

          return (
            <ObjectItem
              key={object.id}
              object={object}
              onClick={onClickObject}
            />
          );
        })}
      </div>
    </div>
  );
}

const ObjectItem = memo(
  ({
    object,
    onClick,
  }: {
    object: ObjectType;
    onClick: (id: number) => void;
  }) => {
    return (
      <div className="p-6 bg-gray-100" onClick={() => onClick?.(object.id)}>
        {object.name}: {object.count}
      </div>
    );
  },
);
