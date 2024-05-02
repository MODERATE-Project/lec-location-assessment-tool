import { FixedSizeList as List } from "react-window";

const CustomMenuList = props => {
  const itemHeight = 40;
  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * itemHeight;

  return (
    <div>
      {children.length > 0 &&
        <List
          height={children.length > 8 ? maxHeight : children.length * itemHeight}
          itemCount={children.length}
          itemSize={itemHeight}
          initialScrollOffset={initialOffset}
        >
          {({ index, style }) => <div style={style}>{children[index]}</div>}
        </List>}
    </div>
  );
};

export default CustomMenuList;