import { roundContentWithLimit } from '../roundContentWithLimit';

describe('roundContentWithLimit', () => {

  it ('Rounds text when the content is bigger than the limit', () => {
    const result = roundContentWithLimit('1234567890'.repeat(30), ['additional'], 240);

    expect(result).toMatchSnapshot();
  });

  it ('Won\'t round text in the content is less than or equal to the limit', () => {
    const result = roundContentWithLimit('1234567890', ['additional'], 240);

    expect(result).toMatchSnapshot();
  });
});
