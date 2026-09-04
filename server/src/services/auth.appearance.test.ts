import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appearanceSchema } from '../validators/auth.validators';

describe('appearance settings', () => {
  it('accepts system, light, and dark', () => {
    for (const appearance of ['system', 'light', 'dark'] as const) {
      const parsed = appearanceSchema.safeParse({ appearance });
      assert.equal(parsed.success, true);
    }
  });

  it('rejects unknown appearance values', () => {
    const parsed = appearanceSchema.safeParse({ appearance: 'midnight' });
    assert.equal(parsed.success, false);
  });
});
