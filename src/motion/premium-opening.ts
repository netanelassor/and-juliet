import type {PremiumMask} from './premium-masks';

// Original painted pixels, traced in source coordinates. Hands cover the quill
// shaft at its pivot; the neck/cuff hide the small joins of these finite gestures.
export const openingPieces = {
  quill: {
    solidPaths: ['M177 250 C206 230 230 231 254 237 C285 245 315 269 337 296 L350 325 L341 330 C325 307 304 293 282 285 C246 272 215 263 177 250Z'],
    strokes: [{d:'M210 247 Q300 265 344 329 L378 414',width:5}],
  },
  finger: {
    solidPaths: ['M766 351 L758 333 L756 310 L756 292 Q747 282 752 267 L764 253 L763 210 Q758 194 767 191 Q775 189 777 204 L787 238 Q797 234 800 246 L795 267 L792 287 L797 310 L807 336 L801 347 L784 355Z'],
    strokes: [],
  },
  head: {
    solidPaths: ['M288 161 C294 137 322 121 344 120 C364 108 386 111 404 127 L420 151 L437 163 L453 170 L466 190 Q489 197 479 210 L467 218 Q480 238 466 250 L450 260 L454 278 L432 291 L408 281 L391 272 C373 284 349 275 337 263 L318 258 C298 259 283 246 291 232 C274 224 268 207 282 195 C269 181 279 169 288 161Z'],
    strokes: [],
  },
};
export const openingMask: PremiumMask = {
  viewBox:[1536,1024], solidPaths:Object.values(openingPieces).flatMap(p=>p.solidPaths),
  strokes:Object.values(openingPieces).flatMap(p=>p.strokes), holes:[],
  fixedForegroundPaths:['M323 309 Q339 301 352 313 L369 343 L377 373 Q375 387 361 387 L344 374 L334 349 L317 333Z'],
  origin:[431,274], recommendedTravel:'Quill up to 7 degrees, forearm 5 degrees and head 2 degrees. Return precisely to the original drawing.',
};
