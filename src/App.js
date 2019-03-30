import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);
  return <>
    {count}
    <button onClick={() => setCount(count + 1)}>+</button>
    <button onClick={() => setCount(count - 1)}>-</button>
  </>
};
