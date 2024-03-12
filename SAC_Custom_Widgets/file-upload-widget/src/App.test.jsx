import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import App from './App';
import DataImportServiceApi from './api/dataImportService';
global.ResizeObserver = require('resize-observer-polyfill')

import {describe, test} from 'vitest';

describe("Builder panel test", () => {
    test("renders the builder title and subtitle", () => {
      new DataImportServiceApi("http://exampleDisUrl.sap/api/v1/dataimport")
      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        render(<App isAdminMode={true} setWidgetAttribute={() => {}} />);
      })
      const title = screen.getByText("File Upload", {exact: true});
      const subtitle = screen.getByText("Configure File Upload Widget", {exact: true});
      expect(title).toBeInTheDocument();
      expect(subtitle).toBeInTheDocument();
    })
})