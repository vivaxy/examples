import { Suspense } from 'react';
import './App.css';
import SuspenseEnabledComponent from './SuspenseEnabledComponent';

function Loading() {
  return <h1>Loading...</h1>;
}

function App() {
  return (
    <div className="App">
      <Suspense fallback={<Loading />}>
        <SuspenseEnabledComponent />
      </Suspense>
    </div>
  );
}

export default App;
