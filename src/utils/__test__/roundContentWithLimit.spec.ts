import { roundContentWithLimit } from '../roundContentWithLimit';

describe('roundContentWithLimit', () => {

  it ('Rounds text when the content is bigger than the limit', () => {
    const result = roundContentWithLimit('1234567890'.repeat(30), ['additional'], 240);

    expect(result).toBe(
      '12345678901234567890123456789012345678901234567890' +
      '12345678901234567890123456789012345678901234567890' +
      '12345678901234567890123456789012345678901234567890' +
      '12345678901234567890123456789012345678901234567890' +
      '1234567890123456789012345678901234567890' +
      'additional ...',
    );
  });

  it ('Won\'t round text in the content is less than or equal to the limit', () => {
    const result = roundContentWithLimit('1234567890', ['additional'], 240);

    expect(result).toBe('1234567890 additional');
  });
});
