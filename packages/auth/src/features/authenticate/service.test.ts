import {
  verifyToken,
  getStoredUserInformation
} from '@auth/features/authenticate/service'

describe('authenticate service errors', () => {
  describe('verifyToken - token expired', () => {
    it('returns a JWT Error for an expired token', () => {
      const expiredToken =
        // tslint:disable-next-line:max-line-length
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MzMxMTY2NDMsImV4cCI6MTUzMzExNTY0MywiYXVkIjpbInVzZXItbWFuYWdlbWVudCJdLCJzdWIiOiIxIn0.H_Mi4fIZCCr4PGNrB9KCFZPlByK4GlB74ikU9f92u0TbqJFDSYB-rIgbAYfRGquhS0RrrfYmK88Lik3t9bbpDY1DV4_gJP95oTNZntMKGmlB9GqlTbSWaYWUKyT6uTty6ZI4Rq2C5XWQiGL_MRnNy92SiXDUqBtBgk4Wp5Elu8P6NCemq1DiA9busl3JxzFgpyGUz4Fdrq40k-hasaAFUl1tnfC4otMqVVGMGDOisfe-yDkdAAXo5EvT9N3MgTuMbwBozwnq03vRcWRGL_05ndLHFyA-29LAJTcUNCkgpVVz0yruMuN_akyCsui-eC8_10eJYYy8wwKoAFqAxxOLiSACBQg6iUbepvj4BKimfPnbU0PATGulJi78RvW_ufn2see_7GLvh64pEosbYJtaRxsHDie5VW2ftWWSTyuswi7r1-DrQtCqn6bV4fa0x0FzmHn4sC3zQbT9o5cy0EYkZgj9ymCMPvdNWD5uLevjxNzlethAqABAhMD4fSF7OFtnVfxaFhWeZ3JLSgvfYhP_VuAx9wZ7MqfW7J_P9PBhMsb68MClBfi9wN21Gzx3K1rKH09Xmp6eh2f7whDXEduUHmY2T4j3BG4biLRJhsFh-0kZt9tbt8zERHm7wybh0CFGHQc_fE3-vvbo69p2bnLNQoZWEJUS6W24dOgNj5SBuCk'

      expect(() => verifyToken(expiredToken)).toThrowErrorMatchingSnapshot()
    })
    it('returns an Error for a malformed token', () => {
      const badToken = 'ytfhgfgf'
      expect(() => verifyToken(badToken)).toThrowErrorMatchingSnapshot()
    })
  })

  describe('getStoredUserInformation - cannot find a user', () => {
    it('returns an Error if a user cannot be found', () => {
      const badNonce = 'ytfhgfjhgf'

      expect(
        getStoredUserInformation(badNonce)
      ).rejects.toThrowErrorMatchingSnapshot()
    })
  })
})
