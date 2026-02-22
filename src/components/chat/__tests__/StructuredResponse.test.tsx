import { render, screen } from '@/test/test-utils';
import { StructuredResponse } from '../StructuredResponse';
import type { StructuredResponse as StructuredResponseType } from '@/types/message.types';

describe('StructuredResponse', () => {
  const baseData: StructuredResponseType = {
    summary: 'Summary **markdown**',
    sections: [
      { title: 'Overview', content: 'General info', type: 'info' },
      { title: 'Steps to follow', content: '1. First\n2. Second', type: 'steps' },
      { title: 'Risk', content: 'Be careful', type: 'warning' },
      { title: 'Recommendation', content: 'Do this', type: 'tip' },
    ],
    keyPoints: ['Point A', 'Point B'],
    relatedTopics: ['Topic 1', 'Topic 2'],
  };

  it('should render summary and all sections', () => {
    render(<StructuredResponse data={baseData} />);

    expect(screen.getByTestId('structured-response')).toBeInTheDocument();
    expect(screen.getByTestId('structured-summary')).toHaveTextContent('Summary markdown');
    expect(screen.getByTestId('section-info')).toBeInTheDocument();
    expect(screen.getByTestId('section-steps')).toBeInTheDocument();
    expect(screen.getByTestId('section-warning')).toBeInTheDocument();
    expect(screen.getByTestId('section-tip')).toBeInTheDocument();
  });

  it('should render key points and related topics when provided', () => {
    render(<StructuredResponse data={baseData} />);

    expect(screen.getByTestId('key-points')).toBeInTheDocument();
    expect(screen.getByText('Point A')).toBeInTheDocument();
    expect(screen.getByText('Point B')).toBeInTheDocument();

    expect(screen.getByTestId('related-topics')).toBeInTheDocument();
    expect(screen.getByText('Topic 1')).toBeInTheDocument();
    expect(screen.getByText('Topic 2')).toBeInTheDocument();
  });

  it('should hide optional blocks when arrays are missing or empty', () => {
    const minimalData: StructuredResponseType = {
      summary: 'Only summary',
      sections: [],
      keyPoints: [],
      relatedTopics: [],
    };

    render(<StructuredResponse data={minimalData} />);

    expect(screen.queryByTestId('key-points')).not.toBeInTheDocument();
    expect(screen.queryByTestId('related-topics')).not.toBeInTheDocument();
    expect(screen.queryByTestId('section-info')).not.toBeInTheDocument();
  });
});
