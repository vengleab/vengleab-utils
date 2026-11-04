import { createContext } from 'react';

const pageContext = createContext<{ activeItem: string }>({ activeItem: '' });

export default pageContext;
