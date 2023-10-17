import { FixedSizeList as List } from "react-window";
 
const CustomMenuList = props => {
 const itemHeight = 35;
 const { options, children, maxHeight, getValue } = props;
 const [value] = getValue();
 const initialOffset = options.indexOf(value) * itemHeight;
 
 return (
   <div>
     <List
       height={maxHeight}
       itemCount={children.length}
       itemSize={itemHeight}
       initialScrollOffset={initialOffset}
     >
       {({ index, style }) => <div style={style}>{children[index]}</div>}
     </List>
   </div>
 );
};

export default CustomMenuList;