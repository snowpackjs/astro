import React, { useState } from "react";

 const Counter: React.FC = () => {
     const [count, setCount] = useState<number>(0);

     const increment = () => {
         setCount((prevCount) => prevCount + 1);
     };

     const decrement = () => {
         setCount((prevCount) => prevCount - 1);
     };

     return (
         <div>
             <h2>Counter</h2>
             <div>
                 <button onClick={decrement}>-</button>
                 <span>{count}</span>
                 <button onClick={increment}>+</button>
             </div>
         </div>
     );
 };

 export default Counter;