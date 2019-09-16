import React from 'react';
import Title from './Title';

const App: React.FC = () => {
  return (
    <div className="App">
      <Title requiredProp="required value" />
    </div>
  );
};

export default App;
