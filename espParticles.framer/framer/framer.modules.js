require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"coffeePhysics/base":[function(require,module,exports){

/* Allows safe, dyamic creation of namespaces. */
var namespace;

namespace = function(id) {
  var i, len, path, ref, results, root;
  root = self;
  ref = id.split('.');
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    path = ref[i];
    results.push(root = root[path] != null ? root[path] : root[path] = {});
  }
  return results;
};


/* RequestAnimationFrame shim. */

(function() {
  var i, len, time, vendor, vendors;
  time = 0;
  vendors = ['ms', 'moz', 'webkit', 'o'];
  for (i = 0, len = vendors.length; i < len; i++) {
    vendor = vendors[i];
    if (!(!window.requestAnimationFrame)) {
      continue;
    }
    window.requestAnimationFrame = window[vendor + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendor + 'CancelAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback, element) {
      var delta, now, old;
      now = new Date().getTime();
      delta = Math.max(0, 16 - (now - old));
      setTimeout((function() {
        return callback(time + delta);
      }), delta);
      return old = now + delta;
    };
  }
  if (!window.cancelAnimationFrame) {
    return window.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    };
  }
})();


},{}],"coffeePhysics/behaviour/Attraction":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Attraction Behaviour */

exports.Attraction = (function(superClass) {
  extend(Attraction, superClass);

  function Attraction(target, radius1, strength) {
    this.target = target != null ? target : new Vector();
    this.radius = radius1 != null ? radius1 : 1000;
    this.strength = strength != null ? strength : 100.0;
    this._delta = new Vector();
    this.setRadius(this.radius);
    Attraction.__super__.constructor.apply(this, arguments);
  }


  /* Sets the effective radius of the bahavious. */

  Attraction.prototype.setRadius = function(radius) {
    this.radius = radius;
    return this.radiusSq = radius * radius;
  };

  Attraction.prototype.apply = function(p, dt, index) {
    var distSq;
    (this._delta.copy(this.target)).sub(p.pos);
    distSq = this._delta.magSq();
    if (distSq < this.radiusSq && distSq > 0.000001) {
      this._delta.norm().scale(1.0 - distSq / this.radiusSq);
      return p.acc.add(this._delta.scale(this.strength));
    }
  };

  return Attraction;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/Behaviour":[function(require,module,exports){

/* Behaviour */
exports.Behaviour = (function() {
  Behaviour.GUID = 0;

  function Behaviour() {
    this.GUID = Behaviour.GUID++;
    this.interval = 1;
  }

  Behaviour.prototype.apply = function(p, dt, index) {
    var name;
    return (p[name = '__behaviour' + this.GUID] != null ? p[name] : p[name] = {
      counter: 0
    }).counter++;
  };

  return Behaviour;

})();


},{}],"coffeePhysics/behaviour/Collision":[function(require,module,exports){

/* Import Behaviour */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Collision Behaviour */

exports.Collision = (function(superClass) {
  extend(Collision, superClass);

  function Collision(useMass, callback) {
    this.useMass = useMass != null ? useMass : true;
    this.callback = callback != null ? callback : null;
    this.pool = [];
    this._delta = new Vector();
    Collision.__super__.constructor.apply(this, arguments);
  }

  Collision.prototype.apply = function(p, dt, index) {
    var dist, distSq, i, len, mt, o, overlap, r1, r2, radii, ref, results;
    ref = this.pool.slice(index);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      o = ref[i];
      if (!(o !== p)) {
        continue;
      }
      (this._delta.copy(o.pos)).sub(p.pos);
      distSq = this._delta.magSq();
      radii = p.radius + o.radius;
      if (distSq <= radii * radii) {
        dist = Math.sqrt(distSq);
        overlap = radii - dist;
        overlap += 0.5;
        mt = p.mass + o.mass;
        r1 = this.useMass ? o.mass / mt : 0.5;
        r2 = this.useMass ? p.mass / mt : 0.5;
        p.pos.add(this._delta.clone().norm().scale(overlap * -r1));
        o.pos.add(this._delta.norm().scale(overlap * r2));
        results.push(typeof this.callback === "function" ? this.callback(p, o, overlap) : void 0);
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  return Collision;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/ConstantForce":[function(require,module,exports){

/* Import Behaviour */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Constant Force Behaviour */

exports.ConstantForce = (function(superClass) {
  extend(ConstantForce, superClass);

  function ConstantForce(force) {
    this.force = force != null ? force : new Vector();
    ConstantForce.__super__.constructor.apply(this, arguments);
  }

  ConstantForce.prototype.apply = function(p, dt, index) {
    return p.acc.add(this.force);
  };

  return ConstantForce;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/EdgeBounce":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Edge Bounce Behaviour */

exports.EdgeBounce = (function(superClass) {
  extend(EdgeBounce, superClass);

  function EdgeBounce(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeBounce.__super__.constructor.apply(this, arguments);
  }

  EdgeBounce.prototype.apply = function(p, dt, index) {
    if (p.pos.x - p.radius < this.min.x) {
      p.pos.x = this.min.x + p.radius;
    } else if (p.pos.x + p.radius > this.max.x) {
      p.pos.x = this.max.x - p.radius;
    }
    if (p.pos.y - p.radius < this.min.y) {
      return p.pos.y = this.min.y + p.radius;
    } else if (p.pos.y + p.radius > this.max.y) {
      return p.pos.y = this.max.y - p.radius;
    }
  };

  return EdgeBounce;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/EdgeWrap":[function(require,module,exports){

/* Imports */
var Behaviour, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Edge Wrap Behaviour */

exports.EdgeWrap = (function(superClass) {
  extend(EdgeWrap, superClass);

  function EdgeWrap(min, max) {
    this.min = min != null ? min : new Vector();
    this.max = max != null ? max : new Vector();
    EdgeWrap.__super__.constructor.apply(this, arguments);
  }

  EdgeWrap.prototype.apply = function(p, dt, index) {
    if (p.pos.x + p.radius < this.min.x) {
      p.pos.x = this.max.x + p.radius;
      p.old.pos.x = p.pos.x;
    } else if (p.pos.x - p.radius > this.max.x) {
      p.pos.x = this.min.x - p.radius;
      p.old.pos.x = p.pos.x;
    }
    if (p.pos.y + p.radius < this.min.y) {
      p.pos.y = this.max.y + p.radius;
      return p.old.pos.y = p.pos.y;
    } else if (p.pos.y - p.radius > this.max.y) {
      p.pos.y = this.min.y - p.radius;
      return p.old.pos.y = p.pos.y;
    }
  };

  return EdgeWrap;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/behaviour/Gravity":[function(require,module,exports){

/* Imports */
var ConstantForce,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ConstantForce = require('coffeePhysics/behaviour/ConstantForce').ConstantForce;


/* Gravity Behaviour */

exports.Gravity = (function(superClass) {
  extend(Gravity, superClass);

  function Gravity(scale1) {
    var force, scale;
    this.scale = scale1 != null ? scale1 : 1000;
    Gravity.__super__.constructor.call(this);
    force = this.force;
    scale = this.scale;
    window.addEventListener("devicemotion", function() {
      var accX, accY;
      accX = event.accelerationIncludingGravity.x;
      accY = event.accelerationIncludingGravity.y * -1;
      force.x = accX * scale / 10;
      return force.y = accY * scale / 10;
    });
  }

  return Gravity;

})(ConstantForce);


},{"coffeePhysics/behaviour/ConstantForce":"coffeePhysics/behaviour/ConstantForce"}],"coffeePhysics/behaviour/Wander":[function(require,module,exports){

/* Imports */
var Behaviour,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;


/* Wander Behaviour */

exports.Wander = (function(superClass) {
  extend(Wander, superClass);

  function Wander(jitter, radius, strength) {
    this.jitter = jitter != null ? jitter : 0.5;
    this.radius = radius != null ? radius : 100;
    this.strength = strength != null ? strength : 1.0;
    this.theta = Math.random() * Math.PI * 2;
    Wander.__super__.constructor.apply(this, arguments);
  }

  Wander.prototype.apply = function(p, dt, index) {
    this.theta += (Math.random() - 0.5) * this.jitter * Math.PI * 2;
    p.acc.x += Math.cos(this.theta) * this.radius * this.strength;
    return p.acc.y += Math.sin(this.theta) * this.radius * this.strength;
  };

  return Wander;

})(Behaviour);


},{"coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour"}],"coffeePhysics/demos/AttractionDemo":[function(require,module,exports){
var AttractionDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

AttractionDemo = (function(superClass) {
  extend(AttractionDemo, superClass);

  function AttractionDemo() {
    return AttractionDemo.__super__.constructor.apply(this, arguments);
  }

  AttractionDemo.prototype.setup = function(full) {
    var attraction, bounds, collide, i, j, max, min, p, ref, repulsion, results;
    if (full == null) {
      full = true;
    }
    AttractionDemo.__super__.setup.call(this, full);
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    bounds = new EdgeBounce(min, max);
    this.physics.integrator = new Verlet();
    attraction = new Attraction(this.mouse.pos, 1200, 1200);
    repulsion = new Attraction(this.mouse.pos, 200, -2000);
    collide = new Collision();
    max = full ? 400 : 200;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.1, 3.0));
      p.setRadius(p.mass * 4);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      p.behaviours.push(attraction);
      p.behaviours.push(repulsion);
      p.behaviours.push(bounds);
      p.behaviours.push(collide);
      collide.pool.push(p);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  return AttractionDemo;

})(Demo);


},{}],"coffeePhysics/demos/BalloonDemo":[function(require,module,exports){

/* BalloonDemo */
var BalloonDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BalloonDemo = (function(superClass) {
  extend(BalloonDemo, superClass);

  function BalloonDemo() {
    return BalloonDemo.__super__.constructor.apply(this, arguments);
  }

  BalloonDemo.prototype.setup = function(full) {
    var attraction, i, j, max, p, ref, results, s;
    if (full == null) {
      full = true;
    }
    BalloonDemo.__super__.setup.apply(this, arguments);
    this.physics.integrator = new ImprovedEuler();
    attraction = new Attraction(this.mouse.pos);
    max = full ? 400 : 200;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.25, 4.0));
      p.setRadius(p.mass * 8);
      p.behaviours.push(new Wander(0.2));
      p.behaviours.push(attraction);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      s = new Spring(this.mouse, p, Random(30, 300), 1.0);
      this.physics.particles.push(p);
      results.push(this.physics.springs.push(s));
    }
    return results;
  };

  return BalloonDemo;

})(Demo);


},{}],"coffeePhysics/demos/BoundsDemo":[function(require,module,exports){

/* BoundsDemo */
var BoundsDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

BoundsDemo = (function(superClass) {
  extend(BoundsDemo, superClass);

  function BoundsDemo() {
    return BoundsDemo.__super__.constructor.apply(this, arguments);
  }

  BoundsDemo.prototype.setup = function() {
    var edge, i, j, max, min, p, results;
    BoundsDemo.__super__.setup.apply(this, arguments);
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    edge = new EdgeWrap(min, max);
    results = [];
    for (i = j = 0; j <= 200; i = ++j) {
      p = new Particle(Random(0.5, 4.0));
      p.setRadius(p.mass * 5);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      p.behaviours.push(new Wander(0.2, 120, Random(1.0, 2.0)));
      p.behaviours.push(edge);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  return BoundsDemo;

})(Demo);


},{}],"coffeePhysics/demos/ChainDemo":[function(require,module,exports){
var ChainDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ChainDemo = (function(superClass) {
  extend(ChainDemo, superClass);

  function ChainDemo() {
    return ChainDemo.__super__.constructor.apply(this, arguments);
  }

  ChainDemo.prototype.setup = function(full) {
    var center, edge, gap, i, j, max, min, op, p, ref, s, wander;
    if (full == null) {
      full = true;
    }
    ChainDemo.__super__.setup.apply(this, arguments);
    this.stiffness = 1.0;
    this.spacing = 2.0;
    this.physics.integrator = new Verlet();
    this.physics.viscosity = 0.0001;
    this.mouse.setMass(1000);
    gap = 50.0;
    min = new Vector(-gap, -gap);
    max = new Vector(this.width + gap, this.height + gap);
    edge = new EdgeBounce(min, max);
    center = new Vector(this.width * 0.5, this.height * 0.5);
    wander = new Wander(0.05, 100.0, 80.0);
    max = full ? 2000 : 600;
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(6.0);
      p.colour = '#FFFFFF';
      p.moveTo(center);
      p.setRadius(1.0);
      p.behaviours.push(wander);
      p.behaviours.push(edge);
      this.physics.particles.push(p);
      if (typeof op !== "undefined" && op !== null) {
        s = new Spring(op, p, this.spacing, this.stiffness);
      } else {
        s = new Spring(this.mouse, p, this.spacing, this.stiffness);
      }
      this.physics.springs.push(s);
      op = p;
    }
    return this.physics.springs.push(new Spring(this.mouse, p, this.spacing, this.stiffness));
  };

  return ChainDemo;

})(Demo);


},{}],"coffeePhysics/demos/ClothDemo":[function(require,module,exports){
var ClothDemo,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

ClothDemo = (function(superClass) {
  extend(ClothDemo, superClass);

  function ClothDemo() {
    return ClothDemo.__super__.constructor.apply(this, arguments);
  }

  ClothDemo.prototype.setup = function(full) {
    var cell, cols, i, j, p, ref, ref1, rows, s, size, stiffness, sx, sy, x, y;
    if (full == null) {
      full = true;
    }
    ClothDemo.__super__.setup.apply(this, arguments);
    this.renderer.renderParticles = false;
    this.physics.integrator = new Verlet();
    this.physics.timestep = 1.0 / 200;
    this.mouse.setMass(10);
    this.gravity = new ConstantForce(new Vector(0.0, 80.0));
    this.physics.behaviours.push(this.gravity);
    stiffness = 0.5;
    size = full ? 8 : 10;
    rows = full ? 30 : 25;
    cols = full ? 55 : 40;
    cell = [];
    sx = this.width * 0.5 - cols * size * 0.5;
    sy = this.height * 0.5 - rows * size * 0.5;
    for (x = i = 0, ref = cols; 0 <= ref ? i <= ref : i >= ref; x = 0 <= ref ? ++i : --i) {
      cell[x] = [];
      for (y = j = 0, ref1 = rows; 0 <= ref1 ? j <= ref1 : j >= ref1; y = 0 <= ref1 ? ++j : --j) {
        p = new Particle(0.1);
        p.fixed = y === 0;
        p.moveTo(new Vector(sx + x * size, sy + y * size));
        if (x > 0) {
          s = new Spring(p, cell[x - 1][y], size, stiffness);
          this.physics.springs.push(s);
        }
        if (y > 0) {
          s = new Spring(p, cell[x][y - 1], size, stiffness);
          this.physics.springs.push(s);
        }
        this.physics.particles.push(p);
        cell[x][y] = p;
      }
    }
    p = cell[Math.floor(cols / 2)][Math.floor(rows / 2)];
    s = new Spring(this.mouse, p, 10, 1.0);
    this.physics.springs.push(s);
    cell[0][0].fixed = true;
    return cell[cols - 1][0].fixed = true;
  };

  ClothDemo.prototype.step = function() {
    ClothDemo.__super__.step.apply(this, arguments);
    return this.gravity.force.x = 50 * Math.sin(new Date().getTime() * 0.0005);
  };

  return ClothDemo;

})(Demo);


},{}],"coffeePhysics/demos/CollisionDemo":[function(require,module,exports){

/* CollisionDemo */
var CollisionDemo,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CollisionDemo = (function(superClass) {
  extend(CollisionDemo, superClass);

  function CollisionDemo() {
    this.onCollision = bind(this.onCollision, this);
    return CollisionDemo.__super__.constructor.apply(this, arguments);
  }

  CollisionDemo.prototype.setup = function(full) {
    var attraction, bounds, collide, i, j, max, min, p, prob, ref, results, s;
    if (full == null) {
      full = true;
    }
    CollisionDemo.__super__.setup.apply(this, arguments);
    this.physics.integrator = new Verlet();
    min = new Vector(0.0, 0.0);
    max = new Vector(this.width, this.height);
    bounds = new EdgeBounce(min, max);
    collide = new Collision;
    attraction = new Attraction(this.mouse.pos, 2000, 1400);
    max = full ? 350 : 150;
    prob = full ? 0.35 : 0.5;
    results = [];
    for (i = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      p = new Particle(Random(0.5, 4.0));
      p.setRadius(p.mass * 4);
      p.moveTo(new Vector(Random(this.width), Random(this.height)));
      if (Random.bool(prob)) {
        s = new Spring(this.mouse, p, Random(120, 180), 0.8);
        this.physics.springs.push(s);
      } else {
        p.behaviours.push(attraction);
      }
      collide.pool.push(p);
      p.behaviours.push(collide);
      p.behaviours.push(bounds);
      results.push(this.physics.particles.push(p));
    }
    return results;
  };

  CollisionDemo.prototype.onCollision = function(p1, p2) {};

  return CollisionDemo;

})(Demo);


},{}],"coffeePhysics/demos/Demo":[function(require,module,exports){

/* Demo */
var Demo,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Demo = (function() {
  Demo.COLOURS = ['DC0048', 'F14646', '4AE6A9', '7CFF3F', '4EC9D9', 'E4272E'];

  function Demo() {
    this.mousemove = bind(this.mousemove, this);
    this.resize = bind(this.resize, this);
    this.physics = new Physics();
    this.mouse = new Particle();
    this.mouse.fixed = true;
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    this.renderTime = 0;
    this.counter = 0;
  }

  Demo.prototype.setup = function(full) {
    if (full == null) {
      return full = true;
    }

    /* Override and add paticles / springs here */
  };


  /* Initialise the demo (override). */

  Demo.prototype.init = function(container1, renderer1) {
    var i, len, particle, ref;
    this.container = container1;
    this.renderer = renderer1 != null ? renderer1 : new WebGLRenderer();
    this.setup(renderer.gl != null);
    ref = this.physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      particle = ref[i];
      if (particle.colour == null) {
        particle.colour = Random.item(Demo.COLOURS);
      }
    }
    document.addEventListener('touchmove', this.mousemove, false);
    document.addEventListener('mousemove', this.mousemove, false);
    document.addEventListener('resize', this.resize, false);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.mouse = this.mouse;
    this.renderer.init(this.physics);
    return this.resize();
  };


  /* Handler for window resize event. */

  Demo.prototype.resize = function(event) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    return this.renderer.setSize(this.width, this.height);
  };


  /* Update loop. */

  Demo.prototype.step = function() {
    this.physics.step();
    if ((this.renderer.gl != null) || ++this.counter % 3 === 0) {
      return this.renderer.render(this.physics);
    }
  };


  /* Clean up after yourself. */

  Demo.prototype.destroy = function() {
    var error;
    document.removeEventListener('touchmove', this.mousemove, false);
    document.removeEventListener('mousemove', this.mousemove, false);
    document.removeEventListener('resize', this.resize, false);
    try {
      container.removeChild(this.renderer.domElement);
    } catch (error1) {
      error = error1;
    }
    this.renderer.destroy();
    this.physics.destroy();
    this.renderer = null;
    this.physics = null;
    return this.mouse = null;
  };


  /* Handler for window mousemove event. */

  Demo.prototype.mousemove = function(event) {
    var touch;
    event.preventDefault();
    if (event.touches && !!event.touches.length) {
      touch = event.touches[0];
      return this.mouse.pos.set(touch.pageX, touch.pageY);
    } else {
      return this.mouse.pos.set(event.clientX, event.clientY);
    }
  };

  return Demo;

})();


},{}],"coffeePhysics/demos/renderer/CanvasRenderer":[function(require,module,exports){

/* Canvas Renderer */
var CanvasRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

CanvasRenderer = (function(superClass) {
  extend(CanvasRenderer, superClass);

  function CanvasRenderer() {
    this.setSize = bind(this.setSize, this);
    CanvasRenderer.__super__.constructor.apply(this, arguments);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.domElement = this.canvas;
  }

  CanvasRenderer.prototype.init = function(physics) {
    return CanvasRenderer.__super__.init.call(this, physics);
  };

  CanvasRenderer.prototype.render = function(physics) {
    var TWO_PI, dir, i, j, len, len1, p, ref, ref1, s, time, vel;
    CanvasRenderer.__super__.render.call(this, physics);
    time = new Date().getTime();
    vel = new Vector();
    dir = new Vector();
    this.canvas.width = this.canvas.width;
    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.lineWidth = 1;
    if (this.renderParticles) {
      TWO_PI = Math.PI * 2;
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        this.ctx.beginPath();
        this.ctx.arc(p.pos.x, p.pos.y, p.radius, 0, TWO_PI, false);
        this.ctx.fillStyle = '#' + (p.colour || 'FFFFFF');
        this.ctx.fill();
      }
    }
    if (this.renderSprings) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        this.ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
        this.ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
      }
      this.ctx.stroke();
    }
    if (this.renderMouse) {
      this.ctx.fillStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.pos.x, this.mouse.pos.y, 20, 0, TWO_PI);
      this.ctx.fill();
    }
    return this.renderTime = new Date().getTime() - time;
  };

  CanvasRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    CanvasRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    return this.canvas.height = this.height;
  };

  return CanvasRenderer;

})(Renderer);


},{}],"coffeePhysics/demos/renderer/DOMRenderer":[function(require,module,exports){

/* DOM Renderer */

/*

	Updating styles:

	Nodes
 */
var DOMRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

DOMRenderer = (function(superClass) {
  extend(DOMRenderer, superClass);

  function DOMRenderer() {
    this.setSize = bind(this.setSize, this);
    DOMRenderer.__super__.constructor.apply(this, arguments);
    this.useGPU = true;
    this.domElement = document.createElement('div');
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    this.canvas.style.left = 0;
    this.canvas.style.top = 0;
    this.domElement.style.pointerEvents = 'none';
    this.domElement.appendChild(this.canvas);
  }

  DOMRenderer.prototype.init = function(physics) {
    var el, i, len, mr, p, ref, st;
    DOMRenderer.__super__.init.call(this, physics);
    ref = physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      p = ref[i];
      el = document.createElement('span');
      st = el.style;
      st.backgroundColor = p.colour;
      st.borderRadius = p.radius;
      st.marginLeft = -p.radius;
      st.marginTop = -p.radius;
      st.position = 'absolute';
      st.display = 'block';
      st.opacity = 0.85;
      st.height = p.radius * 2;
      st.width = p.radius * 2;
      this.domElement.appendChild(el);
      p.domElement = el;
    }
    el = document.createElement('span');
    st = el.style;
    mr = 20;
    st.backgroundColor = '#ffffff';
    st.borderRadius = mr;
    st.marginLeft = -mr;
    st.marginTop = -mr;
    st.position = 'absolute';
    st.display = 'block';
    st.opacity = 0.1;
    st.height = mr * 2;
    st.width = mr * 2;
    this.domElement.appendChild(el);
    return this.mouse.domElement = el;
  };

  DOMRenderer.prototype.render = function(physics) {
    var i, j, len, len1, p, ref, ref1, s, time;
    DOMRenderer.__super__.render.call(this, physics);
    time = new Date().getTime();
    if (this.renderParticles) {
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (this.useGPU) {
          p.domElement.style.WebkitTransform = "translate3d(" + (p.pos.x | 0) + "px," + (p.pos.y | 0) + "px,0px)";
        } else {
          p.domElement.style.left = p.pos.x;
          p.domElement.style.top = p.pos.y;
        }
      }
    }
    if (this.renderSprings) {
      this.canvas.width = this.canvas.width;
      this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      this.ctx.beginPath();
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        this.ctx.moveTo(s.p1.pos.x, s.p1.pos.y);
        this.ctx.lineTo(s.p2.pos.x, s.p2.pos.y);
      }
      this.ctx.stroke();
    }
    if (this.renderMouse) {
      if (this.useGPU) {
        this.mouse.domElement.style.WebkitTransform = "translate3d(" + (this.mouse.pos.x | 0) + "px," + (this.mouse.pos.y | 0) + "px,0px)";
      } else {
        this.mouse.domElement.style.left = this.mouse.pos.x;
        this.mouse.domElement.style.top = this.mouse.pos.y;
      }
    }
    return this.renderTime = new Date().getTime() - time;
  };

  DOMRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    DOMRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    return this.canvas.height = this.height;
  };

  DOMRenderer.prototype.destroy = function() {
    var results;
    results = [];
    while (this.domElement.hasChildNodes()) {
      results.push(this.domElement.removeChild(this.domElement.lastChild));
    }
    return results;
  };

  return DOMRenderer;

})(Renderer);


},{}],"coffeePhysics/demos/renderer/Renderer":[function(require,module,exports){

/* Base Renderer */
var Renderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Renderer = (function() {
  function Renderer() {
    this.setSize = bind(this.setSize, this);
    this.width = 0;
    this.height = 0;
    this.renderParticles = true;
    this.renderSprings = true;
    this.renderMouse = true;
    this.initialized = false;
    this.renderTime = 0;
  }

  Renderer.prototype.init = function(physics) {
    return this.initialized = true;
  };

  Renderer.prototype.render = function(physics) {
    if (!this.initialized) {
      return this.init(physics);
    }
  };

  Renderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
  };

  Renderer.prototype.destroy = function() {};

  return Renderer;

})();


},{}],"coffeePhysics/demos/renderer/WebGLRenderer":[function(require,module,exports){

/* WebGL Renderer */
var WebGLRenderer,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

WebGLRenderer = (function(superClass) {
  extend(WebGLRenderer, superClass);

  WebGLRenderer.PARTICLE_VS = '\nuniform vec2 viewport;\nattribute vec3 position;\nattribute float radius;\nattribute vec4 colour;\nvarying vec4 tint;\n\nvoid main() {\n\n    // convert the rectangle from pixels to 0.0 to 1.0\n    vec2 zeroToOne = position.xy / viewport;\n    zeroToOne.y = 1.0 - zeroToOne.y;\n\n    // convert from 0->1 to 0->2\n    vec2 zeroToTwo = zeroToOne * 2.0;\n\n    // convert from 0->2 to -1->+1 (clipspace)\n    vec2 clipSpace = zeroToTwo - 1.0;\n\n    tint = colour;\n\n    gl_Position = vec4(clipSpace, 0, 1);\n    gl_PointSize = radius * 2.0;\n}';

  WebGLRenderer.PARTICLE_FS = '\nprecision mediump float;\n\nuniform sampler2D texture;\nvarying vec4 tint;\n\nvoid main() {\n    gl_FragColor = texture2D(texture, gl_PointCoord) * tint;\n}';

  WebGLRenderer.SPRING_VS = '\nuniform vec2 viewport;\nattribute vec3 position;\n\nvoid main() {\n\n    // convert the rectangle from pixels to 0.0 to 1.0\n    vec2 zeroToOne = position.xy / viewport;\n    zeroToOne.y = 1.0 - zeroToOne.y;\n\n    // convert from 0->1 to 0->2\n    vec2 zeroToTwo = zeroToOne * 2.0;\n\n    // convert from 0->2 to -1->+1 (clipspace)\n    vec2 clipSpace = zeroToTwo - 1.0;\n\n    gl_Position = vec4(clipSpace, 0, 1);\n}';

  WebGLRenderer.SPRING_FS = '\nvoid main() {\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 0.1);\n}';

  function WebGLRenderer(usePointSprites) {
    var error;
    this.usePointSprites = usePointSprites != null ? usePointSprites : true;
    this.setSize = bind(this.setSize, this);
    WebGLRenderer.__super__.constructor.apply(this, arguments);
    this.particlePositionBuffer = null;
    this.particleRadiusBuffer = null;
    this.particleColourBuffer = null;
    this.particleTexture = null;
    this.particleShader = null;
    this.springPositionBuffer = null;
    this.springShader = null;
    this.canvas = document.createElement('canvas');
    try {
      this.gl = this.canvas.getContext('experimental-webgl');
    } catch (error1) {
      error = error1;
    } finally {
      if (!this.gl) {
        return new CanvasRenderer();
      }
    }
    this.domElement = this.canvas;
  }

  WebGLRenderer.prototype.init = function(physics) {
    WebGLRenderer.__super__.init.call(this, physics);
    this.initShaders();
    this.initBuffers(physics);
    this.particleTexture = this.createParticleTextureData();
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    return this.gl.enable(this.gl.BLEND);
  };

  WebGLRenderer.prototype.initShaders = function() {
    this.particleShader = this.createShaderProgram(WebGLRenderer.PARTICLE_VS, WebGLRenderer.PARTICLE_FS);
    this.springShader = this.createShaderProgram(WebGLRenderer.SPRING_VS, WebGLRenderer.SPRING_FS);
    this.particleShader.uniforms = {
      viewport: this.gl.getUniformLocation(this.particleShader, 'viewport')
    };
    this.springShader.uniforms = {
      viewport: this.gl.getUniformLocation(this.springShader, 'viewport')
    };
    this.particleShader.attributes = {
      position: this.gl.getAttribLocation(this.particleShader, 'position'),
      radius: this.gl.getAttribLocation(this.particleShader, 'radius'),
      colour: this.gl.getAttribLocation(this.particleShader, 'colour')
    };
    this.springShader.attributes = {
      position: this.gl.getAttribLocation(this.springShader, 'position')
    };
    return console.log(this.particleShader);
  };

  WebGLRenderer.prototype.initBuffers = function(physics) {
    var a, b, colours, g, i, len, particle, r, radii, ref, rgba;
    colours = [];
    radii = [];
    this.particlePositionBuffer = this.gl.createBuffer();
    this.springPositionBuffer = this.gl.createBuffer();
    this.particleColourBuffer = this.gl.createBuffer();
    this.particleRadiusBuffer = this.gl.createBuffer();
    ref = physics.particles;
    for (i = 0, len = ref.length; i < len; i++) {
      particle = ref[i];
      rgba = (particle.colour || '#FFFFFF').match(/[\dA-F]{2}/gi);
      r = (parseInt(rgba[0], 16)) || 255;
      g = (parseInt(rgba[1], 16)) || 255;
      b = (parseInt(rgba[2], 16)) || 255;
      a = (parseInt(rgba[3], 16)) || 255;
      colours.push(r / 255, g / 255, b / 255, a / 255);
      radii.push(particle.radius || 32);
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleColourBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleRadiusBuffer);
    return this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(radii), this.gl.STATIC_DRAW);
  };

  WebGLRenderer.prototype.createParticleTextureData = function(size) {
    var canvas, ctx, rad, texture;
    if (size == null) {
      size = 128;
    }
    canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    ctx = canvas.getContext('2d');
    rad = size * 0.5;
    ctx.beginPath();
    ctx.arc(rad, rad, rad, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fillStyle = '#FFF';
    ctx.fill();
    texture = this.gl.createTexture();
    this.setupTexture(texture, canvas);
    return texture;
  };

  WebGLRenderer.prototype.loadTexture = function(source) {
    var texture;
    texture = this.gl.createTexture();
    texture.image = new Image();
    texture.image.onload = (function(_this) {
      return function() {
        return _this.setupTexture(texture, texture.image);
      };
    })(this);
    texture.image.src = source;
    return texture;
  };

  WebGLRenderer.prototype.setupTexture = function(texture, data) {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.generateMipmap(this.gl.TEXTURE_2D);
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return texture;
  };

  WebGLRenderer.prototype.createShaderProgram = function(_vs, _fs) {
    var fs, prog, vs;
    vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    this.gl.shaderSource(vs, _vs);
    this.gl.shaderSource(fs, _fs);
    this.gl.compileShader(vs);
    this.gl.compileShader(fs);
    if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(vs));
      null;
    }
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS)) {
      alert(this.gl.getShaderInfoLog(fs));
      null;
    }
    prog = this.gl.createProgram();
    this.gl.attachShader(prog, vs);
    this.gl.attachShader(prog, fs);
    this.gl.linkProgram(prog);
    return prog;
  };

  WebGLRenderer.prototype.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    WebGLRenderer.__super__.setSize.call(this, this.width, this.height);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.useProgram(this.particleShader);
    this.gl.uniform2fv(this.particleShader.uniforms.viewport, new Float32Array([this.width, this.height]));
    this.gl.useProgram(this.springShader);
    return this.gl.uniform2fv(this.springShader.uniforms.viewport, new Float32Array([this.width, this.height]));
  };

  WebGLRenderer.prototype.render = function(physics) {
    var i, j, len, len1, p, ref, ref1, s, vertices;
    WebGLRenderer.__super__.render.apply(this, arguments);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    if (this.renderParticles) {
      vertices = [];
      ref = physics.particles;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        vertices.push(p.pos.x, p.pos.y, 0.0);
      }
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.particleTexture);
      this.gl.useProgram(this.particleShader);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particlePositionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.particleShader.attributes.position, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.position);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleColourBuffer);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.colour);
      this.gl.vertexAttribPointer(this.particleShader.attributes.colour, 4, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.particleRadiusBuffer);
      this.gl.enableVertexAttribArray(this.particleShader.attributes.radius);
      this.gl.vertexAttribPointer(this.particleShader.attributes.radius, 1, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.POINTS, 0, vertices.length / 3);
    }
    if (this.renderSprings && physics.springs.length > 0) {
      vertices = [];
      ref1 = physics.springs;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        s = ref1[j];
        vertices.push(s.p1.pos.x, s.p1.pos.y, 0.0);
        vertices.push(s.p2.pos.x, s.p2.pos.y, 0.0);
      }
      this.gl.useProgram(this.springShader);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.springPositionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
      this.gl.vertexAttribPointer(this.springShader.attributes.position, 3, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(this.springShader.attributes.position);
      return this.gl.drawArrays(this.gl.LINES, 0, vertices.length / 3);
    }
  };

  WebGLRenderer.prototype.destroy = function() {};

  return WebGLRenderer;

})(Renderer);


},{}],"coffeePhysics/engine/Particle":[function(require,module,exports){

/* Imports */
var Vector;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Particle */

exports.Particle = (function() {
  Particle.GUID = 0;

  function Particle(mass) {
    this.mass = mass != null ? mass : 1.0;
    this.id = 'p' + Particle.GUID++;
    this.setMass(this.mass);
    this.setRadius(1.0);
    this.fixed = false;
    this.behaviours = [];
    this.pos = new Vector();
    this.vel = new Vector();
    this.acc = new Vector();
    this.old = {
      pos: new Vector(),
      vel: new Vector(),
      acc: new Vector()
    };
  }


  /* Moves the particle to a given location vector. */

  Particle.prototype.moveTo = function(pos) {
    this.pos.copy(pos);
    return this.old.pos.copy(pos);
  };


  /* Sets the mass of the particle. */

  Particle.prototype.setMass = function(mass) {
    this.mass = mass != null ? mass : 1.0;
    return this.massInv = 1.0 / this.mass;
  };


  /* Sets the radius of the particle. */

  Particle.prototype.setRadius = function(radius) {
    this.radius = radius != null ? radius : 1.0;
    return this.radiusSq = this.radius * this.radius;
  };


  /* Applies all behaviours to derive new force. */

  Particle.prototype.update = function(dt, index) {
    var behaviour, i, len, ref, results;
    if (!this.fixed) {
      ref = this.behaviours;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        behaviour = ref[i];
        results.push(behaviour.apply(this, dt, index));
      }
      return results;
    }
  };

  return Particle;

})();


},{"coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/engine/Physics":[function(require,module,exports){

/* Imports */
var Euler;

Euler = require('coffeePhysics/engine/integrator/Euler').Euler;


/* Physics Engine */

exports.Physics = (function() {
  function Physics(integrator) {
    this.integrator = integrator != null ? integrator : new Euler();
    this.timestep = 1.0 / 60;
    this.viscosity = 0.005;
    this.behaviours = [];
    this._time = 0.0;
    this._step = 0.0;
    this._clock = null;
    this._buffer = 0.0;
    this._maxSteps = 4;
    this.particles = [];
    this.springs = [];
  }


  /* Performs a numerical integration step. */

  Physics.prototype.integrate = function(dt) {
    var behaviour, drag, index, j, k, l, len, len1, len2, particle, ref, ref1, ref2, results, spring;
    drag = 1.0 - this.viscosity;
    ref = this.particles;
    for (index = j = 0, len = ref.length; j < len; index = ++j) {
      particle = ref[index];
      ref1 = this.behaviours;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        behaviour = ref1[k];
        behaviour.apply(particle, dt, index);
      }
      particle.update(dt, index);
    }
    this.integrator.integrate(this.particles, dt, drag);
    ref2 = this.springs;
    results = [];
    for (l = 0, len2 = ref2.length; l < len2; l++) {
      spring = ref2[l];
      results.push(spring.apply());
    }
    return results;
  };


  /* Steps the system. */

  Physics.prototype.step = function() {
    var delta, i, time;
    if (this._clock == null) {
      this._clock = new Date().getTime();
    }
    time = new Date().getTime();
    delta = time - this._clock;
    if (delta <= 0.0) {
      return;
    }
    delta *= 0.001;
    this._clock = time;
    this._buffer += delta;
    i = 0;
    while (this._buffer >= this.timestep && ++i < this._maxSteps) {
      this.integrate(this.timestep);
      this._buffer -= this.timestep;
      this._time += this.timestep;
    }
    return this._step = new Date().getTime() - time;
  };


  /* Clean up after yourself. */

  Physics.prototype.destroy = function() {
    this.integrator = null;
    this.particles = null;
    return this.springs = null;
  };

  return Physics;

})();


},{"coffeePhysics/engine/integrator/Euler":"coffeePhysics/engine/integrator/Euler"}],"coffeePhysics/engine/Spring":[function(require,module,exports){

/* Imports */
var Vector;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Spring */

exports.Spring = (function() {
  function Spring(p1, p2, restLength, stiffness) {
    this.p1 = p1;
    this.p2 = p2;
    this.restLength = restLength != null ? restLength : 100;
    this.stiffness = stiffness != null ? stiffness : 1.0;
    this._delta = new Vector();
  }

  Spring.prototype.apply = function() {
    var dist, force;
    (this._delta.copy(this.p2.pos)).sub(this.p1.pos);
    dist = this._delta.mag() + 0.000001;
    force = (dist - this.restLength) / (dist * (this.p1.massInv + this.p2.massInv)) * this.stiffness;
    if (!this.p1.fixed) {
      this.p1.pos.add(this._delta.clone().scale(force * this.p1.massInv));
    }
    if (!this.p2.fixed) {
      return this.p2.pos.add(this._delta.scale(-force * this.p2.massInv));
    }
  };

  return Spring;

})();


},{"coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/engine/integrator/Euler":[function(require,module,exports){

/* Import Integrator */
var Integrator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;


/* Euler Integrator */

exports.Euler = (function(superClass) {
  extend(Euler, superClass);

  function Euler() {
    return Euler.__super__.constructor.apply(this, arguments);
  }

  Euler.prototype.integrate = function(particles, dt, drag) {
    var i, len, p, results, vel;
    vel = new Vector();
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.old.pos.copy(p.pos);
      p.acc.scale(p.massInv);
      vel.copy(p.vel);
      p.vel.add(p.acc.scale(dt));
      p.pos.add(vel.scale(dt));
      if (drag) {
        p.vel.scale(drag);
      }
      results.push(p.acc.clear());
    }
    return results;
  };

  return Euler;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator"}],"coffeePhysics/engine/integrator/ImprovedEuler":[function(require,module,exports){

/* Import Integrator */
var Integrator,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;


/* Improved Euler Integrator */

exports.ImprovedEuler = (function(superClass) {
  extend(ImprovedEuler, superClass);

  function ImprovedEuler() {
    return ImprovedEuler.__super__.constructor.apply(this, arguments);
  }

  ImprovedEuler.prototype.integrate = function(particles, dt, drag) {
    var acc, dtSq, i, len, p, results, vel;
    acc = new Vector();
    vel = new Vector();
    dtSq = dt * dt;
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.old.pos.copy(p.pos);
      p.acc.scale(p.massInv);
      vel.copy(p.vel);
      acc.copy(p.acc);
      p.pos.add((vel.scale(dt)).add(acc.scale(0.5 * dtSq)));
      p.vel.add(p.acc.scale(dt));
      if (drag) {
        p.vel.scale(drag);
      }
      results.push(p.acc.clear());
    }
    return results;
  };

  return ImprovedEuler;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator"}],"coffeePhysics/engine/integrator/Integrator":[function(require,module,exports){

/* Integrator */
exports.Integrator = (function() {
  function Integrator() {}

  Integrator.prototype.integrate = function(particles, dt) {};

  return Integrator;

})();


},{}],"coffeePhysics/engine/integrator/Verlet":[function(require,module,exports){

/* Imports */
var Integrator, Vector,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;

Vector = require('coffeePhysics/math/Vector').Vector;


/* Velocity Verlet Integrator */

exports.Verlet = (function(superClass) {
  extend(Verlet, superClass);

  function Verlet() {
    return Verlet.__super__.constructor.apply(this, arguments);
  }

  Verlet.prototype.integrate = function(particles, dt, drag) {
    var dtSq, i, len, p, pos, results;
    pos = new Vector();
    dtSq = dt * dt;
    results = [];
    for (i = 0, len = particles.length; i < len; i++) {
      p = particles[i];
      if (!(!p.fixed)) {
        continue;
      }
      p.acc.scale(p.massInv);
      (p.vel.copy(p.pos)).sub(p.old.pos);
      if (drag) {
        p.vel.scale(drag);
      }
      (pos.copy(p.pos)).add(p.vel.add(p.acc.scale(dtSq)));
      p.old.pos.copy(p.pos);
      p.pos.copy(pos);
      results.push(p.acc.clear());
    }
    return results;
  };

  return Verlet;

})(Integrator);


},{"coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"coffeePhysics/math/Random":[function(require,module,exports){

/* Random */
exports.Random = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return min + Math.random() * (max - min);
};

Random.int = function(min, max) {
  if (max == null) {
    max = min;
    min = 0;
  }
  return Math.floor(min + Math.random() * (max - min));
};

Random.sign = function(prob) {
  if (prob == null) {
    prob = 0.5;
  }
  if (Math.random() < prob) {
    return 1;
  } else {
    return -1;
  }
};

Random.bool = function(prob) {
  if (prob == null) {
    prob = 0.5;
  }
  return Math.random() < prob;
};

Random.item = function(list) {
  return list[Math.floor(Math.random() * list.length)];
};


},{}],"coffeePhysics/math/Vector":[function(require,module,exports){

/* 2D Vector */
exports.Vector = (function() {

  /* Adds two vectors and returns the product. */
  Vector.add = function(v1, v2) {
    return new Vector(v1.x + v2.x, v1.y + v2.y);
  };


  /* Subtracts v2 from v1 and returns the product. */

  Vector.sub = function(v1, v2) {
    return new Vector(v1.x - v2.x, v1.y - v2.y);
  };


  /* Projects one vector (v1) onto another (v2) */

  Vector.project = function(v1, v2) {
    return v1.clone().scale((v1.dot(v2)) / v1.magSq());
  };


  /* Creates a new Vector instance. */

  function Vector(x, y) {
    this.x = x != null ? x : 0.0;
    this.y = y != null ? y : 0.0;
  }


  /* Sets the components of this vector. */

  Vector.prototype.set = function(x, y) {
    this.x = x;
    this.y = y;
    return this;
  };


  /* Add a vector to this one. */

  Vector.prototype.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };


  /* Subtracts a vector from this one. */

  Vector.prototype.sub = function(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };


  /* Scales this vector by a value. */

  Vector.prototype.scale = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  };


  /* Computes the dot product between vectors. */

  Vector.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
  };


  /* Computes the cross product between vectors. */

  Vector.prototype.cross = function(v) {
    return (this.x * v.y) - (this.y * v.x);
  };


  /* Computes the magnitude (length). */

  Vector.prototype.mag = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  };


  /* Computes the squared magnitude (length). */

  Vector.prototype.magSq = function() {
    return this.x * this.x + this.y * this.y;
  };


  /* Computes the distance to another vector. */

  Vector.prototype.dist = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  };


  /* Computes the squared distance to another vector. */

  Vector.prototype.distSq = function(v) {
    var dx, dy;
    dx = v.x - this.x;
    dy = v.y - this.y;
    return dx * dx + dy * dy;
  };


  /* Normalises the vector, making it a unit vector (of length 1). */

  Vector.prototype.norm = function() {
    var m;
    m = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= m;
    this.y /= m;
    return this;
  };


  /* Limits the vector length to a given amount. */

  Vector.prototype.limit = function(l) {
    var m, mSq;
    mSq = this.x * this.x + this.y * this.y;
    if (mSq > l * l) {
      m = Math.sqrt(mSq);
      this.x /= m;
      this.y /= m;
      this.x *= l;
      this.y *= l;
      return this;
    }
  };


  /* Copies components from another vector. */

  Vector.prototype.copy = function(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
  };


  /* Clones this vector to a new itentical one. */

  Vector.prototype.clone = function() {
    return new Vector(this.x, this.y);
  };


  /* Resets the vector to zero. */

  Vector.prototype.clear = function() {
    this.x = 0.0;
    this.y = 0.0;
    return this;
  };

  return Vector;

})();


},{}],"coffeePhysics":[function(require,module,exports){
var Attraction, Behaviour, Collision, ConstantForce, EdgeBounce, EdgeWrap, Euler, Gravity, ImprovedEuler, Integrator, Particle, Physics, Spring, Vector, Verlet, Wander;

Integrator = require('coffeePhysics/engine/integrator/Integrator').Integrator;

Euler = require('coffeePhysics/engine/integrator/Euler').Euler;

ImprovedEuler = require('coffeePhysics/engine/integrator/ImprovedEuler').ImprovedEuler;

Verlet = require('coffeePhysics/engine/integrator/Verlet').Verlet;

exports.Integrator = Integrator;

exports.Euler = Euler;

exports.ImprovedEuler = ImprovedEuler;

exports.Verlet = Verlet;

Particle = require('coffeePhysics/engine/Particle').Particle;

Physics = require('coffeePhysics/engine/Physics').Physics;

Spring = require('coffeePhysics/engine/Spring').Spring;

exports.Particle = Particle;

exports.Physics = Physics;

exports.Spring = Spring;

Vector = require('coffeePhysics/math/Vector').Vector;

exports.Vector = Vector;

Behaviour = require('coffeePhysics/behaviour/Behaviour').Behaviour;

Attraction = require('coffeePhysics/behaviour/Attraction').Attraction;

Collision = require('coffeePhysics/behaviour/Collision').Collision;

ConstantForce = require('coffeePhysics/behaviour/ConstantForce').ConstantForce;

EdgeBounce = require('coffeePhysics/behaviour/EdgeBounce').EdgeBounce;

EdgeWrap = require('coffeePhysics/behaviour/EdgeWrap').EdgeWrap;

Wander = require('coffeePhysics/behaviour/Wander').Wander;

Gravity = require('coffeePhysics/behaviour/Gravity').Gravity;

exports.Behaviour = Behaviour;

exports.Attraction = Attraction;

exports.Collision = Collision;

exports.ConstantForce = ConstantForce;

exports.EdgeBounce = EdgeBounce;

exports.EdgeWrap = EdgeWrap;

exports.Wander = Wander;

exports.Gravity = Gravity;


},{"coffeePhysics/behaviour/Attraction":"coffeePhysics/behaviour/Attraction","coffeePhysics/behaviour/Behaviour":"coffeePhysics/behaviour/Behaviour","coffeePhysics/behaviour/Collision":"coffeePhysics/behaviour/Collision","coffeePhysics/behaviour/ConstantForce":"coffeePhysics/behaviour/ConstantForce","coffeePhysics/behaviour/EdgeBounce":"coffeePhysics/behaviour/EdgeBounce","coffeePhysics/behaviour/EdgeWrap":"coffeePhysics/behaviour/EdgeWrap","coffeePhysics/behaviour/Gravity":"coffeePhysics/behaviour/Gravity","coffeePhysics/behaviour/Wander":"coffeePhysics/behaviour/Wander","coffeePhysics/engine/Particle":"coffeePhysics/engine/Particle","coffeePhysics/engine/Physics":"coffeePhysics/engine/Physics","coffeePhysics/engine/Spring":"coffeePhysics/engine/Spring","coffeePhysics/engine/integrator/Euler":"coffeePhysics/engine/integrator/Euler","coffeePhysics/engine/integrator/ImprovedEuler":"coffeePhysics/engine/integrator/ImprovedEuler","coffeePhysics/engine/integrator/Integrator":"coffeePhysics/engine/integrator/Integrator","coffeePhysics/engine/integrator/Verlet":"coffeePhysics/engine/integrator/Verlet","coffeePhysics/math/Vector":"coffeePhysics/math/Vector"}],"js/sketch-min":[function(require,module,exports){
/* Copyright (C) 2013 Justin Windle, http://soulwire.co.uk */
!function(e,t){"object"==typeof exports?module.exports=t(e,e.document):"function"==typeof define&&define.amd?define(function(){return t(e,e.document)}):e.Sketch=t(e,e.document)}("undefined"!=typeof window?window:this,function(e,t){"use strict";function n(e){return"[object Array]"==Object.prototype.toString.call(e)}function o(e){return"function"==typeof e}function r(e){return"number"==typeof e}function i(e){return"string"==typeof e}function u(e){return C[e]||String.fromCharCode(e)}function a(e,t,n){for(var o in t)!n&&o in e||(e[o]=t[o]);return e}function c(e,t){return function(){e.apply(t,arguments)}}function l(e){var t={};for(var n in e)"webkitMovementX"!==n&&"webkitMovementY"!==n&&(o(e[n])?t[n]=c(e[n],e):t[n]=e[n]);return t}function s(e){function t(t){o(t)&&t.apply(e,[].splice.call(arguments,1))}function n(e){for(_=0;_<ee.length;_++)B=ee[_],i(B)?S[(e?"add":"remove")+"EventListener"].call(S,B,N,!1):o(B)?N=B:S=B}function r(){I(A),A=R(r),K||(t(e.setup),K=o(e.setup)),U||(t(e.resize),U=o(e.resize)),e.running&&!q&&(e.dt=(z=+new Date)-e.now,e.millis+=e.dt,e.now=z,t(e.update),Z&&(e.retina&&(e.save(),e.autoclear&&e.scale(V,V)),e.autoclear&&e.clear()),t(e.draw),Z&&e.retina&&e.restore()),q=++q%e.interval}function c(){S=J?e.style:e.canvas,D=J?"px":"",Y=e.width,j=e.height,e.fullscreen&&(j=e.height=v.innerHeight,Y=e.width=v.innerWidth),e.retina&&Z&&V&&(S.style.height=j+"px",S.style.width=Y+"px",Y*=V,j*=V),S.height!==j&&(S.height=j+D),S.width!==Y&&(S.width=Y+D),Z&&!e.autoclear&&e.retina&&e.scale(V,V),K&&t(e.resize)}function s(e,t){return L=t.getBoundingClientRect(),e.x=e.pageX-L.left-(v.scrollX||v.pageXOffset),e.y=e.pageY-L.top-(v.scrollY||v.pageYOffset),e}function f(t,n){return s(t,e.element),n=n||{},n.ox=n.x||t.x,n.oy=n.y||t.y,n.x=t.x,n.y=t.y,n.dx=n.x-n.ox,n.dy=n.y-n.oy,n}function d(e){if(e.preventDefault(),G=l(e),G.originalEvent=e,G.touches)for(Q.length=G.touches.length,_=0;_<G.touches.length;_++)Q[_]=f(G.touches[_],Q[_]);else Q.length=0,Q[0]=f(G,$);return a($,Q[0],!0),G}function p(n){for(n=d(n),M=(X=ee.indexOf(W=n.type))-1,e.dragging=!!/down|start/.test(W)||!/up|end/.test(W)&&e.dragging;M;)i(ee[M])?t(e[ee[M--]],n):i(ee[X])?t(e[ee[X++]],n):M=0}function g(n){F=n.keyCode,H="keyup"==n.type,te[F]=te[u(F)]=!H,t(e[n.type],n)}function m(n){e.autopause&&("blur"==n.type?E:y)(),t(e[n.type],n)}function y(){e.now=+new Date,e.running=!0}function E(){e.running=!1}function k(){(e.running?E:y)()}function P(){Z&&e.clearRect(0,0,e.width*V,e.height*V)}function T(){O=e.element.parentNode,_=b.indexOf(e),O&&O.removeChild(e.element),~_&&b.splice(_,1),n(!1),E()}var A,N,S,O,L,_,D,z,B,G,W,F,H,M,X,Y,j,q=0,Q=[],U=!1,K=!1,V=v.devicePixelRatio||1,J=e.type==w,Z=e.type==h,$={x:0,y:0,ox:0,oy:0,dx:0,dy:0},ee=[e.eventTarget||e.element,p,"mousedown","touchstart",p,"mousemove","touchmove",p,"mouseup","touchend",p,"click",p,"mouseout",p,"mouseover",x,g,"keydown","keyup",v,m,"focus","blur",c,"resize"],te={};for(F in C)te[C[F]]=!1;return a(e,{touches:Q,mouse:$,keys:te,dragging:!1,running:!1,millis:0,now:NaN,dt:NaN,destroy:T,toggle:k,clear:P,start:y,stop:E}),b.push(e),e.autostart&&y(),n(!0),c(),r(),e}for(var f,d,p="E LN10 LN2 LOG2E LOG10E PI SQRT1_2 SQRT2 abs acos asin atan ceil cos exp floor log round sin sqrt tan atan2 pow max min".split(" "),g="__hasSketch",m=Math,h="canvas",y="webgl",w="dom",x=t,v=e,b=[],E={fullscreen:!0,autostart:!0,autoclear:!0,autopause:!0,container:x.body,interval:1,globals:!0,retina:!1,type:h},C={8:"BACKSPACE",9:"TAB",13:"ENTER",16:"SHIFT",27:"ESCAPE",32:"SPACE",37:"LEFT",38:"UP",39:"RIGHT",40:"DOWN"},k={CANVAS:h,WEB_GL:y,WEBGL:y,DOM:w,instances:b,install:function(e){if(!e[g]){for(var t=0;t<p.length;t++)e[p[t]]=m[p[t]];a(e,{TWO_PI:2*m.PI,HALF_PI:m.PI/2,QUARTER_PI:m.PI/4,random:function(e,t){return n(e)?e[~~(m.random()*e.length)]:(r(t)||(t=e||1,e=0),e+m.random()*(t-e))},lerp:function(e,t,n){return e+n*(t-e)},map:function(e,t,n,o,r){return(e-t)/(n-t)*(r-o)+o}}),e[g]=!0}},create:function(e){return e=a(e||{},E),e.globals&&k.install(self),f=e.element=e.element||x.createElement(e.type===w?"div":"canvas"),d=e.context=e.context||function(){switch(e.type){case h:return f.getContext("2d",e);case y:return f.getContext("webgl",e)||f.getContext("experimental-webgl",e);case w:return f.canvas=f}}(),(e.container||x.body).appendChild(f),k.augment(d,e)},augment:function(e,t){return t=a(t||{},E),t.element=e.canvas||e,t.element.className+=" sketch",a(e,t,!0),s(e)}},P=["ms","moz","webkit","o"],T=self,A=0,N="AnimationFrame",S="request"+N,O="cancel"+N,R=T[S],I=T[O],L=0;L<P.length&&!R;L++)R=T[P[L]+"Request"+N],I=T[P[L]+"Cancel"+N];return T[S]=R=R||function(e){var t=+new Date,n=m.max(0,16-(t-A)),o=setTimeout(function(){e(t+n)},n);return A=t+n,o},T[O]=I=I||function(e){clearTimeout(e)},k});
},{}],"js/sketch":[function(require,module,exports){

/* Copyright (C) 2013 Justin Windle, http://soulwire.co.uk */

(function ( root, factory ) {

  if ( typeof exports === 'object' ) {

    // CommonJS like
    module.exports = factory(root, root.document);

  } else if ( typeof define === 'function' && define.amd ) {

    // AMD
    define( function() { return factory( root, root.document ); });

  } else {

    // Browser global
    root.Sketch = factory( root, root.document );
  }

}( typeof window !== "undefined" ? window : this, function ( window, document ) {


  "use strict";

  /*
  ----------------------------------------------------------------------

    Config

  ----------------------------------------------------------------------
  */

  var MATH_PROPS = 'E LN10 LN2 LOG2E LOG10E PI SQRT1_2 SQRT2 abs acos asin atan ceil cos exp floor log round sin sqrt tan atan2 pow max min'.split( ' ' );
  var HAS_SKETCH = '__hasSketch';
  var M = Math;

  var CANVAS = 'canvas';
  var WEBGL = 'webgl';
  var DOM = 'dom';

  var doc = document;
  var win = window;

  var instances = [];

  var defaults = {

    fullscreen: true,
    autostart: true,
    autoclear: true,
    autopause: true,
    container: doc.body,
    interval: 1,
    globals: true,
    retina: false,
    type: CANVAS
  };

  var keyMap = {

     8: 'BACKSPACE',
     9: 'TAB',
    13: 'ENTER',
    16: 'SHIFT',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'LEFT',
    38: 'UP',
    39: 'RIGHT',
    40: 'DOWN'
  };

  /*
  ----------------------------------------------------------------------

    Utilities

  ----------------------------------------------------------------------
  */

  function isArray( object ) {

    return Object.prototype.toString.call( object ) == '[object Array]';
  }

  function isFunction( object ) {

    return typeof object == 'function';
  }

  function isNumber( object ) {

    return typeof object == 'number';
  }

  function isString( object ) {

    return typeof object == 'string';
  }

  function keyName( code ) {

    return keyMap[ code ] || String.fromCharCode( code );
  }

  function extend( target, source, overwrite ) {

    for ( var key in source )

      if ( overwrite || !( key in target ) )

        target[ key ] = source[ key ];

    return target;
  }

  function proxy( method, context ) {

    return function() {

      method.apply( context, arguments );
    };
  }

  function clone( target ) {

    var object = {};

    for ( var key in target ) {
      
      if ( key === 'webkitMovementX' || key === 'webkitMovementY' )
        continue;

      if ( isFunction( target[ key ] ) )

        object[ key ] = proxy( target[ key ], target );

      else

        object[ key ] = target[ key ];
    }

    return object;
  }

  /*
  ----------------------------------------------------------------------

    Constructor

  ----------------------------------------------------------------------
  */

  function constructor( context ) {

    var request, handler, target, parent, bounds, index, suffix, clock, node, copy, type, key, val, min, max, w, h;

    var counter = 0;
    var touches = [];
    var resized = false;
    var setup = false;
    var ratio = win.devicePixelRatio || 1;
    var isDiv = context.type == DOM;
    var is2D = context.type == CANVAS;

    var mouse = {
      x:  0.0, y:  0.0,
      ox: 0.0, oy: 0.0,
      dx: 0.0, dy: 0.0
    };

    var eventMap = [

      context.eventTarget || context.element,

        pointer, 'mousedown', 'touchstart',
        pointer, 'mousemove', 'touchmove',
        pointer, 'mouseup', 'touchend',
        pointer, 'click',
        pointer, 'mouseout',
        pointer, 'mouseover',

      doc,

        keypress, 'keydown', 'keyup',

      win,

        active, 'focus', 'blur',
        resize, 'resize'
    ];

    var keys = {}; for ( key in keyMap ) keys[ keyMap[ key ] ] = false;

    function trigger( method ) {

      if ( isFunction( method ) )

        method.apply( context, [].splice.call( arguments, 1 ) );
    }

    function bind( on ) {

      for ( index = 0; index < eventMap.length; index++ ) {

        node = eventMap[ index ];

        if ( isString( node ) )

          target[ ( on ? 'add' : 'remove' ) + 'EventListener' ].call( target, node, handler, false );

        else if ( isFunction( node ) )

          handler = node;

        else target = node;
      }
    }

    function update() {

      cAF( request );
      request = rAF( update );

      if ( !setup ) {

        trigger( context.setup );
        setup = isFunction( context.setup );
      }

      if ( !resized ) {
        trigger( context.resize );
        resized = isFunction( context.resize );
      }

      if ( context.running && !counter ) {

        context.dt = ( clock = +new Date() ) - context.now;
        context.millis += context.dt;
        context.now = clock;

        trigger( context.update );

        // Pre draw

        if ( is2D ) {

          if ( context.retina ) {

            context.save();
            
            if (context.autoclear) {
              context.scale( ratio, ratio );
            }
          }

          if ( context.autoclear )

            context.clear();
        }

        // Draw

        trigger( context.draw );

        // Post draw

        if ( is2D && context.retina )

          context.restore();
      }

      counter = ++counter % context.interval;
    }

    function resize() {

      target = isDiv ? context.style : context.canvas;
      suffix = isDiv ? 'px' : '';

      w = context.width;
      h = context.height;

      if ( context.fullscreen ) {

        h = context.height = win.innerHeight;
        w = context.width = win.innerWidth;
      }

      if ( context.retina && is2D && ratio ) {

        target.style.height = h + 'px';
        target.style.width = w + 'px';

        w *= ratio;
        h *= ratio;
      }

      if ( target.height !== h )

        target.height = h + suffix;

      if ( target.width !== w )

        target.width = w + suffix;

      if ( is2D && !context.autoclear && context.retina )

        context.scale( ratio, ratio );

      if ( setup ) trigger( context.resize );
    }

    function align( touch, target ) {

      bounds = target.getBoundingClientRect();

      touch.x = touch.pageX - bounds.left - (win.scrollX || win.pageXOffset);
      touch.y = touch.pageY - bounds.top - (win.scrollY || win.pageYOffset);

      return touch;
    }

    function augment( touch, target ) {

      align( touch, context.element );

      target = target || {};

      target.ox = target.x || touch.x;
      target.oy = target.y || touch.y;

      target.x = touch.x;
      target.y = touch.y;

      target.dx = target.x - target.ox;
      target.dy = target.y - target.oy;

      return target;
    }

    function process( event ) {

      event.preventDefault();

      copy = clone( event );
      copy.originalEvent = event;

      if ( copy.touches ) {

        touches.length = copy.touches.length;

        for ( index = 0; index < copy.touches.length; index++ )

          touches[ index ] = augment( copy.touches[ index ], touches[ index ] );

      } else {

        touches.length = 0;
        touches[0] = augment( copy, mouse );
      }

      extend( mouse, touches[0], true );

      return copy;
    }

    function pointer( event ) {

      event = process( event );

      min = ( max = eventMap.indexOf( type = event.type ) ) - 1;

      context.dragging =

        /down|start/.test( type ) ? true :

        /up|end/.test( type ) ? false :

        context.dragging;

      while( min )

        isString( eventMap[ min ] ) ?

          trigger( context[ eventMap[ min-- ] ], event ) :

        isString( eventMap[ max ] ) ?

          trigger( context[ eventMap[ max++ ] ], event ) :

        min = 0;
    }

    function keypress( event ) {

      key = event.keyCode;
      val = event.type == 'keyup';
      keys[ key ] = keys[ keyName( key ) ] = !val;

      trigger( context[ event.type ], event );
    }

    function active( event ) {

      if ( context.autopause )

        ( event.type == 'blur' ? stop : start )();

      trigger( context[ event.type ], event );
    }

    // Public API

    function start() {

      context.now = +new Date();
      context.running = true;
    }

    function stop() {

      context.running = false;
    }

    function toggle() {

      ( context.running ? stop : start )();
    }

    function clear() {

      if ( is2D )

        context.clearRect( 0, 0, context.width * ratio, context.height * ratio );
    }

    function destroy() {

      parent = context.element.parentNode;
      index = instances.indexOf( context );

      if ( parent ) parent.removeChild( context.element );
      if ( ~index ) instances.splice( index, 1 );

      bind( false );
      stop();
    }

    extend( context, {

      touches: touches,
      mouse: mouse,
      keys: keys,

      dragging: false,
      running: false,
      millis: 0,
      now: NaN,
      dt: NaN,

      destroy: destroy,
      toggle: toggle,
      clear: clear,
      start: start,
      stop: stop
    });

    instances.push( context );

    return ( context.autostart && start(), bind( true ), resize(), update(), context );
  }

  /*
  ----------------------------------------------------------------------

    Global API

  ----------------------------------------------------------------------
  */

  var element, context, Sketch = {

    CANVAS: CANVAS,
    WEB_GL: WEBGL,
    WEBGL: WEBGL,
    DOM: DOM,

    instances: instances,

    install: function( context ) {

      if ( !context[ HAS_SKETCH ] ) {

        for ( var i = 0; i < MATH_PROPS.length; i++ )

          context[ MATH_PROPS[i] ] = M[ MATH_PROPS[i] ];

        extend( context, {

          TWO_PI: M.PI * 2,
          HALF_PI: M.PI / 2,
          QUARTER_PI: M.PI / 4,

          random: function( min, max ) {

            if ( isArray( min ) )

              return min[ ~~( M.random() * min.length ) ];

            if ( !isNumber( max ) )

              max = min || 1, min = 0;

            return min + M.random() * ( max - min );
          },

          lerp: function( min, max, amount ) {

            return min + amount * ( max - min );
          },

          map: function( num, minA, maxA, minB, maxB ) {

            return ( num - minA ) / ( maxA - minA ) * ( maxB - minB ) + minB;
          }
        });

        context[ HAS_SKETCH ] = true;
      }
    },

    create: function( options ) {

      options = extend( options || {}, defaults );

      if ( options.globals ) Sketch.install( self );

      element = options.element = options.element || doc.createElement( options.type === DOM ? 'div' : 'canvas' );

      context = options.context = options.context || (function() {

        switch( options.type ) {

          case CANVAS:

            return element.getContext( '2d', options );

          case WEBGL:

            return element.getContext( 'webgl', options ) || element.getContext( 'experimental-webgl', options );

          case DOM:

            return element.canvas = element;
        }

      })();

      ( options.container || doc.body ).appendChild( element );

      return Sketch.augment( context, options );
    },

    augment: function( context, options ) {

      options = extend( options || {}, defaults );

      options.element = context.canvas || context;
      options.element.className += ' sketch';

      extend( context, options, true );

      return constructor( context );
    }
  };

  /*
  ----------------------------------------------------------------------

    Shims

  ----------------------------------------------------------------------
  */

  var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
  var scope = self;
  var then = 0;

  var a = 'AnimationFrame';
  var b = 'request' + a;
  var c = 'cancel' + a;

  var rAF = scope[ b ];
  var cAF = scope[ c ];

  for ( var i = 0; i < vendors.length && !rAF; i++ ) {

    rAF = scope[ vendors[ i ] + 'Request' + a ];
    cAF = scope[ vendors[ i ] + 'Cancel' + a ];
  }

  scope[ b ] = rAF = rAF || function( callback ) {

    var now = +new Date();
    var dt = M.max( 0, 16 - ( now - then ) );
    var id = setTimeout( function() {
      callback( now + dt );
    }, dt );

    then = now + dt;
    return id;
  };

  scope[ c ] = cAF = cAF || function( id ) {
    clearTimeout( id );
  };

  /*
  ----------------------------------------------------------------------

    Output

  ----------------------------------------------------------------------
  */

  return Sketch;

}));

},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvanMvc2tldGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9qcy9za2V0Y2gubWluLmpzIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3Rvci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvbWF0aC9SYW5kb20uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL1ZlcmxldC5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvSW50ZWdyYXRvci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvSW1wcm92ZWRFdWxlci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvRXVsZXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9TcHJpbmcuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2VuZ2luZS9QaHlzaWNzLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9lbmdpbmUvUGFydGljbGUuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL3JlbmRlcmVyL1dlYkdMUmVuZGVyZXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL3JlbmRlcmVyL1JlbmRlcmVyLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9yZW5kZXJlci9ET01SZW5kZXJlci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvcmVuZGVyZXIvQ2FudmFzUmVuZGVyZXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL0RlbW8uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL0NvbGxpc2lvbkRlbW8uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2RlbW9zL0Nsb3RoRGVtby5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvQ2hhaW5EZW1vLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9Cb3VuZHNEZW1vLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9kZW1vcy9CYWxsb29uRGVtby5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvZGVtb3MvQXR0cmFjdGlvbkRlbW8uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9XYW5kZXIuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9HcmF2aXR5LmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvRWRnZVdyYXAuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9FZGdlQm91bmNlLmNvZmZlZSIsIi4uLy4uLy4uLy4uLy4uL1VzZXJzL2VkbW9udGVycnViaW8vZ2l0aHViL2VzcFBhcnRpY2xlcy9lc3BQYXJ0aWNsZXMuZnJhbWVyL21vZHVsZXMvY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvQ29uc3RhbnRGb3JjZS5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0NvbGxpc2lvbi5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91ci5jb2ZmZWUiLCIuLi8uLi8uLi8uLi8uLi9Vc2Vycy9lZG1vbnRlcnJ1YmlvL2dpdGh1Yi9lc3BQYXJ0aWNsZXMvZXNwUGFydGljbGVzLmZyYW1lci9tb2R1bGVzL2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0F0dHJhY3Rpb24uY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvZWRtb250ZXJydWJpby9naXRodWIvZXNwUGFydGljbGVzL2VzcFBhcnRpY2xlcy5mcmFtZXIvbW9kdWxlcy9jb2ZmZWVQaHlzaWNzL2Jhc2UuY29mZmVlIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qIENvcHlyaWdodCAoQykgMjAxMyBKdXN0aW4gV2luZGxlLCBodHRwOi8vc291bHdpcmUuY28udWsgKi9cblxuKGZ1bmN0aW9uICggcm9vdCwgZmFjdG9yeSApIHtcblxuICBpZiAoIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyApIHtcblxuICAgIC8vIENvbW1vbkpTIGxpa2VcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnkocm9vdCwgcm9vdC5kb2N1bWVudCk7XG5cbiAgfSBlbHNlIGlmICggdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuXG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmdW5jdGlvbigpIHsgcmV0dXJuIGZhY3RvcnkoIHJvb3QsIHJvb3QuZG9jdW1lbnQgKTsgfSk7XG5cbiAgfSBlbHNlIHtcblxuICAgIC8vIEJyb3dzZXIgZ2xvYmFsXG4gICAgcm9vdC5Ta2V0Y2ggPSBmYWN0b3J5KCByb290LCByb290LmRvY3VtZW50ICk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uICggd2luZG93LCBkb2N1bWVudCApIHtcblxuXG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIC8qXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIENvbmZpZ1xuXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgKi9cblxuICB2YXIgTUFUSF9QUk9QUyA9ICdFIExOMTAgTE4yIExPRzJFIExPRzEwRSBQSSBTUVJUMV8yIFNRUlQyIGFicyBhY29zIGFzaW4gYXRhbiBjZWlsIGNvcyBleHAgZmxvb3IgbG9nIHJvdW5kIHNpbiBzcXJ0IHRhbiBhdGFuMiBwb3cgbWF4IG1pbicuc3BsaXQoICcgJyApO1xuICB2YXIgSEFTX1NLRVRDSCA9ICdfX2hhc1NrZXRjaCc7XG4gIHZhciBNID0gTWF0aDtcblxuICB2YXIgQ0FOVkFTID0gJ2NhbnZhcyc7XG4gIHZhciBXRUJHTCA9ICd3ZWJnbCc7XG4gIHZhciBET00gPSAnZG9tJztcblxuICB2YXIgZG9jID0gZG9jdW1lbnQ7XG4gIHZhciB3aW4gPSB3aW5kb3c7XG5cbiAgdmFyIGluc3RhbmNlcyA9IFtdO1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcblxuICAgIGZ1bGxzY3JlZW46IHRydWUsXG4gICAgYXV0b3N0YXJ0OiB0cnVlLFxuICAgIGF1dG9jbGVhcjogdHJ1ZSxcbiAgICBhdXRvcGF1c2U6IHRydWUsXG4gICAgY29udGFpbmVyOiBkb2MuYm9keSxcbiAgICBpbnRlcnZhbDogMSxcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIHJldGluYTogZmFsc2UsXG4gICAgdHlwZTogQ0FOVkFTXG4gIH07XG5cbiAgdmFyIGtleU1hcCA9IHtcblxuICAgICA4OiAnQkFDS1NQQUNFJyxcbiAgICAgOTogJ1RBQicsXG4gICAgMTM6ICdFTlRFUicsXG4gICAgMTY6ICdTSElGVCcsXG4gICAgMjc6ICdFU0NBUEUnLFxuICAgIDMyOiAnU1BBQ0UnLFxuICAgIDM3OiAnTEVGVCcsXG4gICAgMzg6ICdVUCcsXG4gICAgMzk6ICdSSUdIVCcsXG4gICAgNDA6ICdET1dOJ1xuICB9O1xuXG4gIC8qXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIFV0aWxpdGllc1xuXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgKi9cblxuICBmdW5jdGlvbiBpc0FycmF5KCBvYmplY3QgKSB7XG5cbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKCBvYmplY3QgKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9XG5cbiAgZnVuY3Rpb24gaXNGdW5jdGlvbiggb2JqZWN0ICkge1xuXG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTnVtYmVyKCBvYmplY3QgKSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PSAnbnVtYmVyJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzU3RyaW5nKCBvYmplY3QgKSB7XG5cbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PSAnc3RyaW5nJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGtleU5hbWUoIGNvZGUgKSB7XG5cbiAgICByZXR1cm4ga2V5TWFwWyBjb2RlIF0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZSggY29kZSApO1xuICB9XG5cbiAgZnVuY3Rpb24gZXh0ZW5kKCB0YXJnZXQsIHNvdXJjZSwgb3ZlcndyaXRlICkge1xuXG4gICAgZm9yICggdmFyIGtleSBpbiBzb3VyY2UgKVxuXG4gICAgICBpZiAoIG92ZXJ3cml0ZSB8fCAhKCBrZXkgaW4gdGFyZ2V0ICkgKVxuXG4gICAgICAgIHRhcmdldFsga2V5IF0gPSBzb3VyY2VbIGtleSBdO1xuXG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHByb3h5KCBtZXRob2QsIGNvbnRleHQgKSB7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG5cbiAgICAgIG1ldGhvZC5hcHBseSggY29udGV4dCwgYXJndW1lbnRzICk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsb25lKCB0YXJnZXQgKSB7XG5cbiAgICB2YXIgb2JqZWN0ID0ge307XG5cbiAgICBmb3IgKCB2YXIga2V5IGluIHRhcmdldCApIHtcbiAgICAgIFxuICAgICAgaWYgKCBrZXkgPT09ICd3ZWJraXRNb3ZlbWVudFgnIHx8IGtleSA9PT0gJ3dlYmtpdE1vdmVtZW50WScgKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKCBpc0Z1bmN0aW9uKCB0YXJnZXRbIGtleSBdICkgKVxuXG4gICAgICAgIG9iamVjdFsga2V5IF0gPSBwcm94eSggdGFyZ2V0WyBrZXkgXSwgdGFyZ2V0ICk7XG5cbiAgICAgIGVsc2VcblxuICAgICAgICBvYmplY3RbIGtleSBdID0gdGFyZ2V0WyBrZXkgXTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgLypcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgQ29uc3RydWN0b3JcblxuICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICovXG5cbiAgZnVuY3Rpb24gY29uc3RydWN0b3IoIGNvbnRleHQgKSB7XG5cbiAgICB2YXIgcmVxdWVzdCwgaGFuZGxlciwgdGFyZ2V0LCBwYXJlbnQsIGJvdW5kcywgaW5kZXgsIHN1ZmZpeCwgY2xvY2ssIG5vZGUsIGNvcHksIHR5cGUsIGtleSwgdmFsLCBtaW4sIG1heCwgdywgaDtcblxuICAgIHZhciBjb3VudGVyID0gMDtcbiAgICB2YXIgdG91Y2hlcyA9IFtdO1xuICAgIHZhciByZXNpemVkID0gZmFsc2U7XG4gICAgdmFyIHNldHVwID0gZmFsc2U7XG4gICAgdmFyIHJhdGlvID0gd2luLmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICB2YXIgaXNEaXYgPSBjb250ZXh0LnR5cGUgPT0gRE9NO1xuICAgIHZhciBpczJEID0gY29udGV4dC50eXBlID09IENBTlZBUztcblxuICAgIHZhciBtb3VzZSA9IHtcbiAgICAgIHg6ICAwLjAsIHk6ICAwLjAsXG4gICAgICBveDogMC4wLCBveTogMC4wLFxuICAgICAgZHg6IDAuMCwgZHk6IDAuMFxuICAgIH07XG5cbiAgICB2YXIgZXZlbnRNYXAgPSBbXG5cbiAgICAgIGNvbnRleHQuZXZlbnRUYXJnZXQgfHwgY29udGV4dC5lbGVtZW50LFxuXG4gICAgICAgIHBvaW50ZXIsICdtb3VzZWRvd24nLCAndG91Y2hzdGFydCcsXG4gICAgICAgIHBvaW50ZXIsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJyxcbiAgICAgICAgcG9pbnRlciwgJ21vdXNldXAnLCAndG91Y2hlbmQnLFxuICAgICAgICBwb2ludGVyLCAnY2xpY2snLFxuICAgICAgICBwb2ludGVyLCAnbW91c2VvdXQnLFxuICAgICAgICBwb2ludGVyLCAnbW91c2VvdmVyJyxcblxuICAgICAgZG9jLFxuXG4gICAgICAgIGtleXByZXNzLCAna2V5ZG93bicsICdrZXl1cCcsXG5cbiAgICAgIHdpbixcblxuICAgICAgICBhY3RpdmUsICdmb2N1cycsICdibHVyJyxcbiAgICAgICAgcmVzaXplLCAncmVzaXplJ1xuICAgIF07XG5cbiAgICB2YXIga2V5cyA9IHt9OyBmb3IgKCBrZXkgaW4ga2V5TWFwICkga2V5c1sga2V5TWFwWyBrZXkgXSBdID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiB0cmlnZ2VyKCBtZXRob2QgKSB7XG5cbiAgICAgIGlmICggaXNGdW5jdGlvbiggbWV0aG9kICkgKVxuXG4gICAgICAgIG1ldGhvZC5hcHBseSggY29udGV4dCwgW10uc3BsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmluZCggb24gKSB7XG5cbiAgICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBldmVudE1hcC5sZW5ndGg7IGluZGV4KysgKSB7XG5cbiAgICAgICAgbm9kZSA9IGV2ZW50TWFwWyBpbmRleCBdO1xuXG4gICAgICAgIGlmICggaXNTdHJpbmcoIG5vZGUgKSApXG5cbiAgICAgICAgICB0YXJnZXRbICggb24gPyAnYWRkJyA6ICdyZW1vdmUnICkgKyAnRXZlbnRMaXN0ZW5lcicgXS5jYWxsKCB0YXJnZXQsIG5vZGUsIGhhbmRsZXIsIGZhbHNlICk7XG5cbiAgICAgICAgZWxzZSBpZiAoIGlzRnVuY3Rpb24oIG5vZGUgKSApXG5cbiAgICAgICAgICBoYW5kbGVyID0gbm9kZTtcblxuICAgICAgICBlbHNlIHRhcmdldCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuXG4gICAgICBjQUYoIHJlcXVlc3QgKTtcbiAgICAgIHJlcXVlc3QgPSByQUYoIHVwZGF0ZSApO1xuXG4gICAgICBpZiAoICFzZXR1cCApIHtcblxuICAgICAgICB0cmlnZ2VyKCBjb250ZXh0LnNldHVwICk7XG4gICAgICAgIHNldHVwID0gaXNGdW5jdGlvbiggY29udGV4dC5zZXR1cCApO1xuICAgICAgfVxuXG4gICAgICBpZiAoICFyZXNpemVkICkge1xuICAgICAgICB0cmlnZ2VyKCBjb250ZXh0LnJlc2l6ZSApO1xuICAgICAgICByZXNpemVkID0gaXNGdW5jdGlvbiggY29udGV4dC5yZXNpemUgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCBjb250ZXh0LnJ1bm5pbmcgJiYgIWNvdW50ZXIgKSB7XG5cbiAgICAgICAgY29udGV4dC5kdCA9ICggY2xvY2sgPSArbmV3IERhdGUoKSApIC0gY29udGV4dC5ub3c7XG4gICAgICAgIGNvbnRleHQubWlsbGlzICs9IGNvbnRleHQuZHQ7XG4gICAgICAgIGNvbnRleHQubm93ID0gY2xvY2s7XG5cbiAgICAgICAgdHJpZ2dlciggY29udGV4dC51cGRhdGUgKTtcblxuICAgICAgICAvLyBQcmUgZHJhd1xuXG4gICAgICAgIGlmICggaXMyRCApIHtcblxuICAgICAgICAgIGlmICggY29udGV4dC5yZXRpbmEgKSB7XG5cbiAgICAgICAgICAgIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoY29udGV4dC5hdXRvY2xlYXIpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5zY2FsZSggcmF0aW8sIHJhdGlvICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCBjb250ZXh0LmF1dG9jbGVhciApXG5cbiAgICAgICAgICAgIGNvbnRleHQuY2xlYXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERyYXdcblxuICAgICAgICB0cmlnZ2VyKCBjb250ZXh0LmRyYXcgKTtcblxuICAgICAgICAvLyBQb3N0IGRyYXdcblxuICAgICAgICBpZiAoIGlzMkQgJiYgY29udGV4dC5yZXRpbmEgKVxuXG4gICAgICAgICAgY29udGV4dC5yZXN0b3JlKCk7XG4gICAgICB9XG5cbiAgICAgIGNvdW50ZXIgPSArK2NvdW50ZXIgJSBjb250ZXh0LmludGVydmFsO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZSgpIHtcblxuICAgICAgdGFyZ2V0ID0gaXNEaXYgPyBjb250ZXh0LnN0eWxlIDogY29udGV4dC5jYW52YXM7XG4gICAgICBzdWZmaXggPSBpc0RpdiA/ICdweCcgOiAnJztcblxuICAgICAgdyA9IGNvbnRleHQud2lkdGg7XG4gICAgICBoID0gY29udGV4dC5oZWlnaHQ7XG5cbiAgICAgIGlmICggY29udGV4dC5mdWxsc2NyZWVuICkge1xuXG4gICAgICAgIGggPSBjb250ZXh0LmhlaWdodCA9IHdpbi5pbm5lckhlaWdodDtcbiAgICAgICAgdyA9IGNvbnRleHQud2lkdGggPSB3aW4uaW5uZXJXaWR0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKCBjb250ZXh0LnJldGluYSAmJiBpczJEICYmIHJhdGlvICkge1xuXG4gICAgICAgIHRhcmdldC5zdHlsZS5oZWlnaHQgPSBoICsgJ3B4JztcbiAgICAgICAgdGFyZ2V0LnN0eWxlLndpZHRoID0gdyArICdweCc7XG5cbiAgICAgICAgdyAqPSByYXRpbztcbiAgICAgICAgaCAqPSByYXRpbztcbiAgICAgIH1cblxuICAgICAgaWYgKCB0YXJnZXQuaGVpZ2h0ICE9PSBoIClcblxuICAgICAgICB0YXJnZXQuaGVpZ2h0ID0gaCArIHN1ZmZpeDtcblxuICAgICAgaWYgKCB0YXJnZXQud2lkdGggIT09IHcgKVxuXG4gICAgICAgIHRhcmdldC53aWR0aCA9IHcgKyBzdWZmaXg7XG5cbiAgICAgIGlmICggaXMyRCAmJiAhY29udGV4dC5hdXRvY2xlYXIgJiYgY29udGV4dC5yZXRpbmEgKVxuXG4gICAgICAgIGNvbnRleHQuc2NhbGUoIHJhdGlvLCByYXRpbyApO1xuXG4gICAgICBpZiAoIHNldHVwICkgdHJpZ2dlciggY29udGV4dC5yZXNpemUgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhbGlnbiggdG91Y2gsIHRhcmdldCApIHtcblxuICAgICAgYm91bmRzID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICB0b3VjaC54ID0gdG91Y2gucGFnZVggLSBib3VuZHMubGVmdCAtICh3aW4uc2Nyb2xsWCB8fCB3aW4ucGFnZVhPZmZzZXQpO1xuICAgICAgdG91Y2gueSA9IHRvdWNoLnBhZ2VZIC0gYm91bmRzLnRvcCAtICh3aW4uc2Nyb2xsWSB8fCB3aW4ucGFnZVlPZmZzZXQpO1xuXG4gICAgICByZXR1cm4gdG91Y2g7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXVnbWVudCggdG91Y2gsIHRhcmdldCApIHtcblxuICAgICAgYWxpZ24oIHRvdWNoLCBjb250ZXh0LmVsZW1lbnQgKTtcblxuICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xuXG4gICAgICB0YXJnZXQub3ggPSB0YXJnZXQueCB8fCB0b3VjaC54O1xuICAgICAgdGFyZ2V0Lm95ID0gdGFyZ2V0LnkgfHwgdG91Y2gueTtcblxuICAgICAgdGFyZ2V0LnggPSB0b3VjaC54O1xuICAgICAgdGFyZ2V0LnkgPSB0b3VjaC55O1xuXG4gICAgICB0YXJnZXQuZHggPSB0YXJnZXQueCAtIHRhcmdldC5veDtcbiAgICAgIHRhcmdldC5keSA9IHRhcmdldC55IC0gdGFyZ2V0Lm95O1xuXG4gICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByb2Nlc3MoIGV2ZW50ICkge1xuXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBjb3B5ID0gY2xvbmUoIGV2ZW50ICk7XG4gICAgICBjb3B5Lm9yaWdpbmFsRXZlbnQgPSBldmVudDtcblxuICAgICAgaWYgKCBjb3B5LnRvdWNoZXMgKSB7XG5cbiAgICAgICAgdG91Y2hlcy5sZW5ndGggPSBjb3B5LnRvdWNoZXMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAoIGluZGV4ID0gMDsgaW5kZXggPCBjb3B5LnRvdWNoZXMubGVuZ3RoOyBpbmRleCsrIClcblxuICAgICAgICAgIHRvdWNoZXNbIGluZGV4IF0gPSBhdWdtZW50KCBjb3B5LnRvdWNoZXNbIGluZGV4IF0sIHRvdWNoZXNbIGluZGV4IF0gKTtcblxuICAgICAgfSBlbHNlIHtcblxuICAgICAgICB0b3VjaGVzLmxlbmd0aCA9IDA7XG4gICAgICAgIHRvdWNoZXNbMF0gPSBhdWdtZW50KCBjb3B5LCBtb3VzZSApO1xuICAgICAgfVxuXG4gICAgICBleHRlbmQoIG1vdXNlLCB0b3VjaGVzWzBdLCB0cnVlICk7XG5cbiAgICAgIHJldHVybiBjb3B5O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBvaW50ZXIoIGV2ZW50ICkge1xuXG4gICAgICBldmVudCA9IHByb2Nlc3MoIGV2ZW50ICk7XG5cbiAgICAgIG1pbiA9ICggbWF4ID0gZXZlbnRNYXAuaW5kZXhPZiggdHlwZSA9IGV2ZW50LnR5cGUgKSApIC0gMTtcblxuICAgICAgY29udGV4dC5kcmFnZ2luZyA9XG5cbiAgICAgICAgL2Rvd258c3RhcnQvLnRlc3QoIHR5cGUgKSA/IHRydWUgOlxuXG4gICAgICAgIC91cHxlbmQvLnRlc3QoIHR5cGUgKSA/IGZhbHNlIDpcblxuICAgICAgICBjb250ZXh0LmRyYWdnaW5nO1xuXG4gICAgICB3aGlsZSggbWluIClcblxuICAgICAgICBpc1N0cmluZyggZXZlbnRNYXBbIG1pbiBdICkgP1xuXG4gICAgICAgICAgdHJpZ2dlciggY29udGV4dFsgZXZlbnRNYXBbIG1pbi0tIF0gXSwgZXZlbnQgKSA6XG5cbiAgICAgICAgaXNTdHJpbmcoIGV2ZW50TWFwWyBtYXggXSApID9cblxuICAgICAgICAgIHRyaWdnZXIoIGNvbnRleHRbIGV2ZW50TWFwWyBtYXgrKyBdIF0sIGV2ZW50ICkgOlxuXG4gICAgICAgIG1pbiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2V5cHJlc3MoIGV2ZW50ICkge1xuXG4gICAgICBrZXkgPSBldmVudC5rZXlDb2RlO1xuICAgICAgdmFsID0gZXZlbnQudHlwZSA9PSAna2V5dXAnO1xuICAgICAga2V5c1sga2V5IF0gPSBrZXlzWyBrZXlOYW1lKCBrZXkgKSBdID0gIXZhbDtcblxuICAgICAgdHJpZ2dlciggY29udGV4dFsgZXZlbnQudHlwZSBdLCBldmVudCApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFjdGl2ZSggZXZlbnQgKSB7XG5cbiAgICAgIGlmICggY29udGV4dC5hdXRvcGF1c2UgKVxuXG4gICAgICAgICggZXZlbnQudHlwZSA9PSAnYmx1cicgPyBzdG9wIDogc3RhcnQgKSgpO1xuXG4gICAgICB0cmlnZ2VyKCBjb250ZXh0WyBldmVudC50eXBlIF0sIGV2ZW50ICk7XG4gICAgfVxuXG4gICAgLy8gUHVibGljIEFQSVxuXG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG5cbiAgICAgIGNvbnRleHQubm93ID0gK25ldyBEYXRlKCk7XG4gICAgICBjb250ZXh0LnJ1bm5pbmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG5cbiAgICAgIGNvbnRleHQucnVubmluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZSgpIHtcblxuICAgICAgKCBjb250ZXh0LnJ1bm5pbmcgPyBzdG9wIDogc3RhcnQgKSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsZWFyKCkge1xuXG4gICAgICBpZiAoIGlzMkQgKVxuXG4gICAgICAgIGNvbnRleHQuY2xlYXJSZWN0KCAwLCAwLCBjb250ZXh0LndpZHRoICogcmF0aW8sIGNvbnRleHQuaGVpZ2h0ICogcmF0aW8gKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZXN0cm95KCkge1xuXG4gICAgICBwYXJlbnQgPSBjb250ZXh0LmVsZW1lbnQucGFyZW50Tm9kZTtcbiAgICAgIGluZGV4ID0gaW5zdGFuY2VzLmluZGV4T2YoIGNvbnRleHQgKTtcblxuICAgICAgaWYgKCBwYXJlbnQgKSBwYXJlbnQucmVtb3ZlQ2hpbGQoIGNvbnRleHQuZWxlbWVudCApO1xuICAgICAgaWYgKCB+aW5kZXggKSBpbnN0YW5jZXMuc3BsaWNlKCBpbmRleCwgMSApO1xuXG4gICAgICBiaW5kKCBmYWxzZSApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cblxuICAgIGV4dGVuZCggY29udGV4dCwge1xuXG4gICAgICB0b3VjaGVzOiB0b3VjaGVzLFxuICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAga2V5czoga2V5cyxcblxuICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgcnVubmluZzogZmFsc2UsXG4gICAgICBtaWxsaXM6IDAsXG4gICAgICBub3c6IE5hTixcbiAgICAgIGR0OiBOYU4sXG5cbiAgICAgIGRlc3Ryb3k6IGRlc3Ryb3ksXG4gICAgICB0b2dnbGU6IHRvZ2dsZSxcbiAgICAgIGNsZWFyOiBjbGVhcixcbiAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgIHN0b3A6IHN0b3BcbiAgICB9KTtcblxuICAgIGluc3RhbmNlcy5wdXNoKCBjb250ZXh0ICk7XG5cbiAgICByZXR1cm4gKCBjb250ZXh0LmF1dG9zdGFydCAmJiBzdGFydCgpLCBiaW5kKCB0cnVlICksIHJlc2l6ZSgpLCB1cGRhdGUoKSwgY29udGV4dCApO1xuICB9XG5cbiAgLypcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgR2xvYmFsIEFQSVxuXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgKi9cblxuICB2YXIgZWxlbWVudCwgY29udGV4dCwgU2tldGNoID0ge1xuXG4gICAgQ0FOVkFTOiBDQU5WQVMsXG4gICAgV0VCX0dMOiBXRUJHTCxcbiAgICBXRUJHTDogV0VCR0wsXG4gICAgRE9NOiBET00sXG5cbiAgICBpbnN0YW5jZXM6IGluc3RhbmNlcyxcblxuICAgIGluc3RhbGw6IGZ1bmN0aW9uKCBjb250ZXh0ICkge1xuXG4gICAgICBpZiAoICFjb250ZXh0WyBIQVNfU0tFVENIIF0gKSB7XG5cbiAgICAgICAgZm9yICggdmFyIGkgPSAwOyBpIDwgTUFUSF9QUk9QUy5sZW5ndGg7IGkrKyApXG5cbiAgICAgICAgICBjb250ZXh0WyBNQVRIX1BST1BTW2ldIF0gPSBNWyBNQVRIX1BST1BTW2ldIF07XG5cbiAgICAgICAgZXh0ZW5kKCBjb250ZXh0LCB7XG5cbiAgICAgICAgICBUV09fUEk6IE0uUEkgKiAyLFxuICAgICAgICAgIEhBTEZfUEk6IE0uUEkgLyAyLFxuICAgICAgICAgIFFVQVJURVJfUEk6IE0uUEkgLyA0LFxuXG4gICAgICAgICAgcmFuZG9tOiBmdW5jdGlvbiggbWluLCBtYXggKSB7XG5cbiAgICAgICAgICAgIGlmICggaXNBcnJheSggbWluICkgKVxuXG4gICAgICAgICAgICAgIHJldHVybiBtaW5bIH5+KCBNLnJhbmRvbSgpICogbWluLmxlbmd0aCApIF07XG5cbiAgICAgICAgICAgIGlmICggIWlzTnVtYmVyKCBtYXggKSApXG5cbiAgICAgICAgICAgICAgbWF4ID0gbWluIHx8IDEsIG1pbiA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBtaW4gKyBNLnJhbmRvbSgpICogKCBtYXggLSBtaW4gKTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgbGVycDogZnVuY3Rpb24oIG1pbiwgbWF4LCBhbW91bnQgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiBtaW4gKyBhbW91bnQgKiAoIG1heCAtIG1pbiApO1xuICAgICAgICAgIH0sXG5cbiAgICAgICAgICBtYXA6IGZ1bmN0aW9uKCBudW0sIG1pbkEsIG1heEEsIG1pbkIsIG1heEIgKSB7XG5cbiAgICAgICAgICAgIHJldHVybiAoIG51bSAtIG1pbkEgKSAvICggbWF4QSAtIG1pbkEgKSAqICggbWF4QiAtIG1pbkIgKSArIG1pbkI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb250ZXh0WyBIQVNfU0tFVENIIF0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBjcmVhdGU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXG4gICAgICBvcHRpb25zID0gZXh0ZW5kKCBvcHRpb25zIHx8IHt9LCBkZWZhdWx0cyApO1xuXG4gICAgICBpZiAoIG9wdGlvbnMuZ2xvYmFscyApIFNrZXRjaC5pbnN0YWxsKCBzZWxmICk7XG5cbiAgICAgIGVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnQgPSBvcHRpb25zLmVsZW1lbnQgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoIG9wdGlvbnMudHlwZSA9PT0gRE9NID8gJ2RpdicgOiAnY2FudmFzJyApO1xuXG4gICAgICBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0IHx8IChmdW5jdGlvbigpIHtcblxuICAgICAgICBzd2l0Y2goIG9wdGlvbnMudHlwZSApIHtcblxuICAgICAgICAgIGNhc2UgQ0FOVkFTOlxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRDb250ZXh0KCAnMmQnLCBvcHRpb25zICk7XG5cbiAgICAgICAgICBjYXNlIFdFQkdMOlxuXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRDb250ZXh0KCAnd2ViZ2wnLCBvcHRpb25zICkgfHwgZWxlbWVudC5nZXRDb250ZXh0KCAnZXhwZXJpbWVudGFsLXdlYmdsJywgb3B0aW9ucyApO1xuXG4gICAgICAgICAgY2FzZSBET006XG5cbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LmNhbnZhcyA9IGVsZW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgfSkoKTtcblxuICAgICAgKCBvcHRpb25zLmNvbnRhaW5lciB8fCBkb2MuYm9keSApLmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XG5cbiAgICAgIHJldHVybiBTa2V0Y2guYXVnbWVudCggY29udGV4dCwgb3B0aW9ucyApO1xuICAgIH0sXG5cbiAgICBhdWdtZW50OiBmdW5jdGlvbiggY29udGV4dCwgb3B0aW9ucyApIHtcblxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCggb3B0aW9ucyB8fCB7fSwgZGVmYXVsdHMgKTtcblxuICAgICAgb3B0aW9ucy5lbGVtZW50ID0gY29udGV4dC5jYW52YXMgfHwgY29udGV4dDtcbiAgICAgIG9wdGlvbnMuZWxlbWVudC5jbGFzc05hbWUgKz0gJyBza2V0Y2gnO1xuXG4gICAgICBleHRlbmQoIGNvbnRleHQsIG9wdGlvbnMsIHRydWUgKTtcblxuICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yKCBjb250ZXh0ICk7XG4gICAgfVxuICB9O1xuXG4gIC8qXG4gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIFNoaW1zXG5cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIHZhciB2ZW5kb3JzID0gWyAnbXMnLCAnbW96JywgJ3dlYmtpdCcsICdvJyBdO1xuICB2YXIgc2NvcGUgPSBzZWxmO1xuICB2YXIgdGhlbiA9IDA7XG5cbiAgdmFyIGEgPSAnQW5pbWF0aW9uRnJhbWUnO1xuICB2YXIgYiA9ICdyZXF1ZXN0JyArIGE7XG4gIHZhciBjID0gJ2NhbmNlbCcgKyBhO1xuXG4gIHZhciByQUYgPSBzY29wZVsgYiBdO1xuICB2YXIgY0FGID0gc2NvcGVbIGMgXTtcblxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhckFGOyBpKysgKSB7XG5cbiAgICByQUYgPSBzY29wZVsgdmVuZG9yc1sgaSBdICsgJ1JlcXVlc3QnICsgYSBdO1xuICAgIGNBRiA9IHNjb3BlWyB2ZW5kb3JzWyBpIF0gKyAnQ2FuY2VsJyArIGEgXTtcbiAgfVxuXG4gIHNjb3BlWyBiIF0gPSByQUYgPSByQUYgfHwgZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXG4gICAgdmFyIG5vdyA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBkdCA9IE0ubWF4KCAwLCAxNiAtICggbm93IC0gdGhlbiApICk7XG4gICAgdmFyIGlkID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBjYWxsYmFjayggbm93ICsgZHQgKTtcbiAgICB9LCBkdCApO1xuXG4gICAgdGhlbiA9IG5vdyArIGR0O1xuICAgIHJldHVybiBpZDtcbiAgfTtcblxuICBzY29wZVsgYyBdID0gY0FGID0gY0FGIHx8IGZ1bmN0aW9uKCBpZCApIHtcbiAgICBjbGVhclRpbWVvdXQoIGlkICk7XG4gIH07XG5cbiAgLypcbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gICAgT3V0cHV0XG5cbiAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAqL1xuXG4gIHJldHVybiBTa2V0Y2g7XG5cbn0pKTtcbiIsIi8qIENvcHlyaWdodCAoQykgMjAxMyBKdXN0aW4gV2luZGxlLCBodHRwOi8vc291bHdpcmUuY28udWsgKi9cbiFmdW5jdGlvbihlLHQpe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzP21vZHVsZS5leHBvcnRzPXQoZSxlLmRvY3VtZW50KTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHQoZSxlLmRvY3VtZW50KX0pOmUuU2tldGNoPXQoZSxlLmRvY3VtZW50KX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbihlLHQpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSl7cmV0dXJuXCJbb2JqZWN0IEFycmF5XVwiPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZSl9ZnVuY3Rpb24gbyhlKXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiBlfWZ1bmN0aW9uIHIoZSl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIGV9ZnVuY3Rpb24gaShlKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgZX1mdW5jdGlvbiB1KGUpe3JldHVybiBDW2VdfHxTdHJpbmcuZnJvbUNoYXJDb2RlKGUpfWZ1bmN0aW9uIGEoZSx0LG4pe2Zvcih2YXIgbyBpbiB0KSFuJiZvIGluIGV8fChlW29dPXRbb10pO3JldHVybiBlfWZ1bmN0aW9uIGMoZSx0KXtyZXR1cm4gZnVuY3Rpb24oKXtlLmFwcGx5KHQsYXJndW1lbnRzKX19ZnVuY3Rpb24gbChlKXt2YXIgdD17fTtmb3IodmFyIG4gaW4gZSlcIndlYmtpdE1vdmVtZW50WFwiIT09biYmXCJ3ZWJraXRNb3ZlbWVudFlcIiE9PW4mJihvKGVbbl0pP3Rbbl09YyhlW25dLGUpOnRbbl09ZVtuXSk7cmV0dXJuIHR9ZnVuY3Rpb24gcyhlKXtmdW5jdGlvbiB0KHQpe28odCkmJnQuYXBwbHkoZSxbXS5zcGxpY2UuY2FsbChhcmd1bWVudHMsMSkpfWZ1bmN0aW9uIG4oZSl7Zm9yKF89MDtfPGVlLmxlbmd0aDtfKyspQj1lZVtfXSxpKEIpP1NbKGU/XCJhZGRcIjpcInJlbW92ZVwiKStcIkV2ZW50TGlzdGVuZXJcIl0uY2FsbChTLEIsTiwhMSk6byhCKT9OPUI6Uz1CfWZ1bmN0aW9uIHIoKXtJKEEpLEE9UihyKSxLfHwodChlLnNldHVwKSxLPW8oZS5zZXR1cCkpLFV8fCh0KGUucmVzaXplKSxVPW8oZS5yZXNpemUpKSxlLnJ1bm5pbmcmJiFxJiYoZS5kdD0oej0rbmV3IERhdGUpLWUubm93LGUubWlsbGlzKz1lLmR0LGUubm93PXosdChlLnVwZGF0ZSksWiYmKGUucmV0aW5hJiYoZS5zYXZlKCksZS5hdXRvY2xlYXImJmUuc2NhbGUoVixWKSksZS5hdXRvY2xlYXImJmUuY2xlYXIoKSksdChlLmRyYXcpLFomJmUucmV0aW5hJiZlLnJlc3RvcmUoKSkscT0rK3ElZS5pbnRlcnZhbH1mdW5jdGlvbiBjKCl7Uz1KP2Uuc3R5bGU6ZS5jYW52YXMsRD1KP1wicHhcIjpcIlwiLFk9ZS53aWR0aCxqPWUuaGVpZ2h0LGUuZnVsbHNjcmVlbiYmKGo9ZS5oZWlnaHQ9di5pbm5lckhlaWdodCxZPWUud2lkdGg9di5pbm5lcldpZHRoKSxlLnJldGluYSYmWiYmViYmKFMuc3R5bGUuaGVpZ2h0PWorXCJweFwiLFMuc3R5bGUud2lkdGg9WStcInB4XCIsWSo9VixqKj1WKSxTLmhlaWdodCE9PWomJihTLmhlaWdodD1qK0QpLFMud2lkdGghPT1ZJiYoUy53aWR0aD1ZK0QpLFomJiFlLmF1dG9jbGVhciYmZS5yZXRpbmEmJmUuc2NhbGUoVixWKSxLJiZ0KGUucmVzaXplKX1mdW5jdGlvbiBzKGUsdCl7cmV0dXJuIEw9dC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxlLng9ZS5wYWdlWC1MLmxlZnQtKHYuc2Nyb2xsWHx8di5wYWdlWE9mZnNldCksZS55PWUucGFnZVktTC50b3AtKHYuc2Nyb2xsWXx8di5wYWdlWU9mZnNldCksZX1mdW5jdGlvbiBmKHQsbil7cmV0dXJuIHModCxlLmVsZW1lbnQpLG49bnx8e30sbi5veD1uLnh8fHQueCxuLm95PW4ueXx8dC55LG4ueD10Lngsbi55PXQueSxuLmR4PW4ueC1uLm94LG4uZHk9bi55LW4ub3ksbn1mdW5jdGlvbiBkKGUpe2lmKGUucHJldmVudERlZmF1bHQoKSxHPWwoZSksRy5vcmlnaW5hbEV2ZW50PWUsRy50b3VjaGVzKWZvcihRLmxlbmd0aD1HLnRvdWNoZXMubGVuZ3RoLF89MDtfPEcudG91Y2hlcy5sZW5ndGg7XysrKVFbX109ZihHLnRvdWNoZXNbX10sUVtfXSk7ZWxzZSBRLmxlbmd0aD0wLFFbMF09ZihHLCQpO3JldHVybiBhKCQsUVswXSwhMCksR31mdW5jdGlvbiBwKG4pe2ZvcihuPWQobiksTT0oWD1lZS5pbmRleE9mKFc9bi50eXBlKSktMSxlLmRyYWdnaW5nPSEhL2Rvd258c3RhcnQvLnRlc3QoVyl8fCEvdXB8ZW5kLy50ZXN0KFcpJiZlLmRyYWdnaW5nO007KWkoZWVbTV0pP3QoZVtlZVtNLS1dXSxuKTppKGVlW1hdKT90KGVbZWVbWCsrXV0sbik6TT0wfWZ1bmN0aW9uIGcobil7Rj1uLmtleUNvZGUsSD1cImtleXVwXCI9PW4udHlwZSx0ZVtGXT10ZVt1KEYpXT0hSCx0KGVbbi50eXBlXSxuKX1mdW5jdGlvbiBtKG4pe2UuYXV0b3BhdXNlJiYoXCJibHVyXCI9PW4udHlwZT9FOnkpKCksdChlW24udHlwZV0sbil9ZnVuY3Rpb24geSgpe2Uubm93PStuZXcgRGF0ZSxlLnJ1bm5pbmc9ITB9ZnVuY3Rpb24gRSgpe2UucnVubmluZz0hMX1mdW5jdGlvbiBrKCl7KGUucnVubmluZz9FOnkpKCl9ZnVuY3Rpb24gUCgpe1omJmUuY2xlYXJSZWN0KDAsMCxlLndpZHRoKlYsZS5oZWlnaHQqVil9ZnVuY3Rpb24gVCgpe089ZS5lbGVtZW50LnBhcmVudE5vZGUsXz1iLmluZGV4T2YoZSksTyYmTy5yZW1vdmVDaGlsZChlLmVsZW1lbnQpLH5fJiZiLnNwbGljZShfLDEpLG4oITEpLEUoKX12YXIgQSxOLFMsTyxMLF8sRCx6LEIsRyxXLEYsSCxNLFgsWSxqLHE9MCxRPVtdLFU9ITEsSz0hMSxWPXYuZGV2aWNlUGl4ZWxSYXRpb3x8MSxKPWUudHlwZT09dyxaPWUudHlwZT09aCwkPXt4OjAseTowLG94OjAsb3k6MCxkeDowLGR5OjB9LGVlPVtlLmV2ZW50VGFyZ2V0fHxlLmVsZW1lbnQscCxcIm1vdXNlZG93blwiLFwidG91Y2hzdGFydFwiLHAsXCJtb3VzZW1vdmVcIixcInRvdWNobW92ZVwiLHAsXCJtb3VzZXVwXCIsXCJ0b3VjaGVuZFwiLHAsXCJjbGlja1wiLHAsXCJtb3VzZW91dFwiLHAsXCJtb3VzZW92ZXJcIix4LGcsXCJrZXlkb3duXCIsXCJrZXl1cFwiLHYsbSxcImZvY3VzXCIsXCJibHVyXCIsYyxcInJlc2l6ZVwiXSx0ZT17fTtmb3IoRiBpbiBDKXRlW0NbRl1dPSExO3JldHVybiBhKGUse3RvdWNoZXM6USxtb3VzZTokLGtleXM6dGUsZHJhZ2dpbmc6ITEscnVubmluZzohMSxtaWxsaXM6MCxub3c6TmFOLGR0Ok5hTixkZXN0cm95OlQsdG9nZ2xlOmssY2xlYXI6UCxzdGFydDp5LHN0b3A6RX0pLGIucHVzaChlKSxlLmF1dG9zdGFydCYmeSgpLG4oITApLGMoKSxyKCksZX1mb3IodmFyIGYsZCxwPVwiRSBMTjEwIExOMiBMT0cyRSBMT0cxMEUgUEkgU1FSVDFfMiBTUVJUMiBhYnMgYWNvcyBhc2luIGF0YW4gY2VpbCBjb3MgZXhwIGZsb29yIGxvZyByb3VuZCBzaW4gc3FydCB0YW4gYXRhbjIgcG93IG1heCBtaW5cIi5zcGxpdChcIiBcIiksZz1cIl9faGFzU2tldGNoXCIsbT1NYXRoLGg9XCJjYW52YXNcIix5PVwid2ViZ2xcIix3PVwiZG9tXCIseD10LHY9ZSxiPVtdLEU9e2Z1bGxzY3JlZW46ITAsYXV0b3N0YXJ0OiEwLGF1dG9jbGVhcjohMCxhdXRvcGF1c2U6ITAsY29udGFpbmVyOnguYm9keSxpbnRlcnZhbDoxLGdsb2JhbHM6ITAscmV0aW5hOiExLHR5cGU6aH0sQz17ODpcIkJBQ0tTUEFDRVwiLDk6XCJUQUJcIiwxMzpcIkVOVEVSXCIsMTY6XCJTSElGVFwiLDI3OlwiRVNDQVBFXCIsMzI6XCJTUEFDRVwiLDM3OlwiTEVGVFwiLDM4OlwiVVBcIiwzOTpcIlJJR0hUXCIsNDA6XCJET1dOXCJ9LGs9e0NBTlZBUzpoLFdFQl9HTDp5LFdFQkdMOnksRE9NOncsaW5zdGFuY2VzOmIsaW5zdGFsbDpmdW5jdGlvbihlKXtpZighZVtnXSl7Zm9yKHZhciB0PTA7dDxwLmxlbmd0aDt0KyspZVtwW3RdXT1tW3BbdF1dO2EoZSx7VFdPX1BJOjIqbS5QSSxIQUxGX1BJOm0uUEkvMixRVUFSVEVSX1BJOm0uUEkvNCxyYW5kb206ZnVuY3Rpb24oZSx0KXtyZXR1cm4gbihlKT9lW35+KG0ucmFuZG9tKCkqZS5sZW5ndGgpXToocih0KXx8KHQ9ZXx8MSxlPTApLGUrbS5yYW5kb20oKSoodC1lKSl9LGxlcnA6ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBlK24qKHQtZSl9LG1hcDpmdW5jdGlvbihlLHQsbixvLHIpe3JldHVybihlLXQpLyhuLXQpKihyLW8pK299fSksZVtnXT0hMH19LGNyZWF0ZTpmdW5jdGlvbihlKXtyZXR1cm4gZT1hKGV8fHt9LEUpLGUuZ2xvYmFscyYmay5pbnN0YWxsKHNlbGYpLGY9ZS5lbGVtZW50PWUuZWxlbWVudHx8eC5jcmVhdGVFbGVtZW50KGUudHlwZT09PXc/XCJkaXZcIjpcImNhbnZhc1wiKSxkPWUuY29udGV4dD1lLmNvbnRleHR8fGZ1bmN0aW9uKCl7c3dpdGNoKGUudHlwZSl7Y2FzZSBoOnJldHVybiBmLmdldENvbnRleHQoXCIyZFwiLGUpO2Nhc2UgeTpyZXR1cm4gZi5nZXRDb250ZXh0KFwid2ViZ2xcIixlKXx8Zi5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIsZSk7Y2FzZSB3OnJldHVybiBmLmNhbnZhcz1mfX0oKSwoZS5jb250YWluZXJ8fHguYm9keSkuYXBwZW5kQ2hpbGQoZiksay5hdWdtZW50KGQsZSl9LGF1Z21lbnQ6ZnVuY3Rpb24oZSx0KXtyZXR1cm4gdD1hKHR8fHt9LEUpLHQuZWxlbWVudD1lLmNhbnZhc3x8ZSx0LmVsZW1lbnQuY2xhc3NOYW1lKz1cIiBza2V0Y2hcIixhKGUsdCwhMCkscyhlKX19LFA9W1wibXNcIixcIm1velwiLFwid2Via2l0XCIsXCJvXCJdLFQ9c2VsZixBPTAsTj1cIkFuaW1hdGlvbkZyYW1lXCIsUz1cInJlcXVlc3RcIitOLE89XCJjYW5jZWxcIitOLFI9VFtTXSxJPVRbT10sTD0wO0w8UC5sZW5ndGgmJiFSO0wrKylSPVRbUFtMXStcIlJlcXVlc3RcIitOXSxJPVRbUFtMXStcIkNhbmNlbFwiK05dO3JldHVybiBUW1NdPVI9Unx8ZnVuY3Rpb24oZSl7dmFyIHQ9K25ldyBEYXRlLG49bS5tYXgoMCwxNi0odC1BKSksbz1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZSh0K24pfSxuKTtyZXR1cm4gQT10K24sb30sVFtPXT1JPUl8fGZ1bmN0aW9uKGUpe2NsZWFyVGltZW91dChlKX0sa30pOyIsIiMgQWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byB5b3VyIHByb2plY3QgaW4gRnJhbWVyIFN0dWRpby5cbiMgbXlNb2R1bGUgPSByZXF1aXJlIFwibXlNb2R1bGVcIlxuIyBSZWZlcmVuY2UgdGhlIGNvbnRlbnRzIGJ5IG5hbWUsIGxpa2UgbXlNb2R1bGUubXlGdW5jdGlvbigpIG9yIG15TW9kdWxlLm15VmFyXG5cblxuIyBJbXBvcnQgaW50ZWdyYXRvciBmcmFtZXdvcmtcbntJbnRlZ3JhdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvSW50ZWdyYXRvcidcbntFdWxlcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0V1bGVyJ1xue0ltcHJvdmVkRXVsZXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvaW50ZWdyYXRvci9JbXByb3ZlZEV1bGVyJ1xue1ZlcmxldH0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL1ZlcmxldCdcblxuZXhwb3J0cy5JbnRlZ3JhdG9yID0gSW50ZWdyYXRvclxuZXhwb3J0cy5FdWxlciA9IEV1bGVyXG5leHBvcnRzLkltcHJvdmVkRXVsZXIgPSBJbXByb3ZlZEV1bGVyXG5leHBvcnRzLlZlcmxldCA9IFZlcmxldFxuXG4jIEltcG9ydCBwaHlzaWNzIGZyYW1ld29ya1xue1BhcnRpY2xlfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL1BhcnRpY2xlJ1xue1BoeXNpY3N9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvUGh5c2ljcydcbntTcHJpbmd9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvU3ByaW5nJ1xuXG5leHBvcnRzLlBhcnRpY2xlID0gUGFydGljbGVcbmV4cG9ydHMuUGh5c2ljcyA9IFBoeXNpY3NcbmV4cG9ydHMuU3ByaW5nID0gU3ByaW5nXG5cbiMgSW1wb3J0IG1hdGggZnJhbWV3b3JrXG4jIHtSYW5kb219ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1JhbmRvbSdcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyBleHBvcnRzLlJhbmRvbSA9IFJhbmRvbVxuZXhwb3J0cy5WZWN0b3IgPSBWZWN0b3JcblxuIyBJbXBvcnQgYmVoYXZpb3VyIGZyYW1ld29ya1xue0JlaGF2aW91cn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXInXG57QXR0cmFjdGlvbn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9BdHRyYWN0aW9uJ1xue0NvbGxpc2lvbn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9Db2xsaXNpb24nXG57Q29uc3RhbnRGb3JjZX0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9Db25zdGFudEZvcmNlJ1xue0VkZ2VCb3VuY2V9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvRWRnZUJvdW5jZSdcbntFZGdlV3JhcH0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9FZGdlV3JhcCdcbntXYW5kZXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvV2FuZGVyJ1xue0dyYXZpdHl9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvR3Jhdml0eSdcblxuZXhwb3J0cy5CZWhhdmlvdXIgPSBCZWhhdmlvdXJcbmV4cG9ydHMuQXR0cmFjdGlvbiA9IEF0dHJhY3Rpb25cbmV4cG9ydHMuQ29sbGlzaW9uID0gQ29sbGlzaW9uXG5leHBvcnRzLkNvbnN0YW50Rm9yY2UgPSBDb25zdGFudEZvcmNlXG5leHBvcnRzLkVkZ2VCb3VuY2UgPSBFZGdlQm91bmNlXG5leHBvcnRzLkVkZ2VXcmFwID0gRWRnZVdyYXBcbmV4cG9ydHMuV2FuZGVyID0gV2FuZGVyXG5leHBvcnRzLkdyYXZpdHkgPSBHcmF2aXR5XG4iLCIjIyMgMkQgVmVjdG9yICMjI1xuXG5jbGFzcyBleHBvcnRzLlZlY3RvclxuXG5cdCMjIyBBZGRzIHR3byB2ZWN0b3JzIGFuZCByZXR1cm5zIHRoZSBwcm9kdWN0LiAjIyNcblx0QGFkZDogKHYxLCB2MikgLT5cblx0XHRuZXcgVmVjdG9yIHYxLnggKyB2Mi54LCB2MS55ICsgdjIueVxuXG5cdCMjIyBTdWJ0cmFjdHMgdjIgZnJvbSB2MSBhbmQgcmV0dXJucyB0aGUgcHJvZHVjdC4gIyMjXG5cdEBzdWI6ICh2MSwgdjIpIC0+XG5cdFx0bmV3IFZlY3RvciB2MS54IC0gdjIueCwgdjEueSAtIHYyLnlcblxuXHQjIyMgUHJvamVjdHMgb25lIHZlY3RvciAodjEpIG9udG8gYW5vdGhlciAodjIpICMjI1xuXHRAcHJvamVjdDogKHYxLCB2MikgLT5cblx0XHR2MS5jbG9uZSgpLnNjYWxlICgodjEuZG90IHYyKSAvIHYxLm1hZ1NxKCkpXG5cblx0IyMjIENyZWF0ZXMgYSBuZXcgVmVjdG9yIGluc3RhbmNlLiAjIyNcblx0Y29uc3RydWN0b3I6IChAeCA9IDAuMCwgQHkgPSAwLjApIC0+XG5cblx0IyMjIFNldHMgdGhlIGNvbXBvbmVudHMgb2YgdGhpcyB2ZWN0b3IuICMjI1xuXHRzZXQ6IChAeCwgQHkpIC0+XG5cdFx0QFxuXG5cdCMjIyBBZGQgYSB2ZWN0b3IgdG8gdGhpcyBvbmUuICMjI1xuXHRhZGQ6ICh2KSAtPlxuXHRcdEB4ICs9IHYueDsgQHkgKz0gdi55OyBAXG5cblx0IyMjIFN1YnRyYWN0cyBhIHZlY3RvciBmcm9tIHRoaXMgb25lLiAjIyNcblx0c3ViOiAodikgLT5cblx0XHRAeCAtPSB2Lng7IEB5IC09IHYueTsgQFxuXG5cdCMjIyBTY2FsZXMgdGhpcyB2ZWN0b3IgYnkgYSB2YWx1ZS4gIyMjXG5cdHNjYWxlOiAoZikgLT5cblx0XHRAeCAqPSBmOyBAeSAqPSBmOyBAXG5cblx0IyMjIENvbXB1dGVzIHRoZSBkb3QgcHJvZHVjdCBiZXR3ZWVuIHZlY3RvcnMuICMjI1xuXHRkb3Q6ICh2KSAtPlxuXHRcdEB4ICogdi54ICsgQHkgKiB2LnlcblxuXHQjIyMgQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3QgYmV0d2VlbiB2ZWN0b3JzLiAjIyNcblx0Y3Jvc3M6ICh2KSAtPlxuXHRcdChAeCAqIHYueSkgLSAoQHkgKiB2LngpXG5cblx0IyMjIENvbXB1dGVzIHRoZSBtYWduaXR1ZGUgKGxlbmd0aCkuICMjI1xuXHRtYWc6IC0+XG5cdFx0TWF0aC5zcXJ0IEB4KkB4ICsgQHkqQHlcblxuXHQjIyMgQ29tcHV0ZXMgdGhlIHNxdWFyZWQgbWFnbml0dWRlIChsZW5ndGgpLiAjIyNcblx0bWFnU3E6IC0+XG5cdFx0QHgqQHggKyBAeSpAeVxuXG5cdCMjIyBDb21wdXRlcyB0aGUgZGlzdGFuY2UgdG8gYW5vdGhlciB2ZWN0b3IuICMjI1xuXHRkaXN0OiAodikgLT5cblx0XHRkeCA9IHYueCAtIEB4OyBkeSA9IHYueSAtIEB5XG5cdFx0TWF0aC5zcXJ0IGR4KmR4ICsgZHkqZHlcblxuXHQjIyMgQ29tcHV0ZXMgdGhlIHNxdWFyZWQgZGlzdGFuY2UgdG8gYW5vdGhlciB2ZWN0b3IuICMjI1xuXHRkaXN0U3E6ICh2KSAtPlxuXHRcdGR4ID0gdi54IC0gQHg7IGR5ID0gdi55IC0gQHlcblx0XHRkeCpkeCArIGR5KmR5XG5cblx0IyMjIE5vcm1hbGlzZXMgdGhlIHZlY3RvciwgbWFraW5nIGl0IGEgdW5pdCB2ZWN0b3IgKG9mIGxlbmd0aCAxKS4gIyMjXG5cdG5vcm06IC0+XG5cdFx0bSA9IE1hdGguc3FydCBAeCpAeCArIEB5KkB5XG5cdFx0QHggLz0gbVxuXHRcdEB5IC89IG1cblx0XHRAXG5cblx0IyMjIExpbWl0cyB0aGUgdmVjdG9yIGxlbmd0aCB0byBhIGdpdmVuIGFtb3VudC4gIyMjXG5cdGxpbWl0OiAobCkgLT5cblx0XHRtU3EgPSBAeCpAeCArIEB5KkB5XG5cdFx0aWYgbVNxID4gbCpsXG5cdFx0XHRtID0gTWF0aC5zcXJ0IG1TcVxuXHRcdFx0QHggLz0gbTsgQHkgLz0gbVxuXHRcdFx0QHggKj0gbDsgQHkgKj0gbFxuXHRcdFx0QFxuXG5cdCMjIyBDb3BpZXMgY29tcG9uZW50cyBmcm9tIGFub3RoZXIgdmVjdG9yLiAjIyNcblx0Y29weTogKHYpIC0+XG5cdFx0QHggPSB2Lng7IEB5ID0gdi55OyBAXG5cblx0IyMjIENsb25lcyB0aGlzIHZlY3RvciB0byBhIG5ldyBpdGVudGljYWwgb25lLiAjIyNcblx0Y2xvbmU6IC0+XG5cdFx0bmV3IFZlY3RvciBAeCwgQHlcblxuXHQjIyMgUmVzZXRzIHRoZSB2ZWN0b3IgdG8gemVyby4gIyMjXG5cdGNsZWFyOiAtPlxuXHRcdEB4ID0gMC4wOyBAeSA9IDAuMDsgQFxuIiwiIyMjIFJhbmRvbSAjIyNcblxuZXhwb3J0cy5SYW5kb20gPSAobWluLCBtYXgpIC0+XG5cblx0aWYgbm90IG1heD9cblx0XHRcdG1heCA9IG1pblxuXHRcdFx0bWluID0gMFxuXG5cdG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKVxuXG5SYW5kb20uaW50ID0gKG1pbiwgbWF4KSAtPlxuXG5cdGlmIG5vdCBtYXg/XG5cdFx0XHRtYXggPSBtaW5cblx0XHRcdG1pbiA9IDBcblxuXHRNYXRoLmZsb29yIG1pbiArIE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKVxuXG5SYW5kb20uc2lnbiA9IChwcm9iID0gMC41KSAtPlxuXG5cdGlmIGRvIE1hdGgucmFuZG9tIDwgcHJvYiB0aGVuIDEgZWxzZSAtMVxuXG5SYW5kb20uYm9vbCA9IChwcm9iID0gMC41KSAtPlxuXG5cdGRvIE1hdGgucmFuZG9tIDwgcHJvYlxuXG5SYW5kb20uaXRlbSA9IChsaXN0KSAtPlxuXG5cdGxpc3RbIE1hdGguZmxvb3IgTWF0aC5yYW5kb20oKSAqIGxpc3QubGVuZ3RoIF1cbiIsIiMjIyBJbXBvcnRzICMjI1xue0ludGVncmF0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9lbmdpbmUvaW50ZWdyYXRvci9JbnRlZ3JhdG9yJ1xue1ZlY3Rvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvVmVjdG9yJ1xuXG5cbiMjIyBWZWxvY2l0eSBWZXJsZXQgSW50ZWdyYXRvciAjIyNcblxuY2xhc3MgZXhwb3J0cy5WZXJsZXQgZXh0ZW5kcyBJbnRlZ3JhdG9yXG5cbiAgICAjIHYgPSB4IC0gb3hcbiAgICAjIHggPSB4ICsgKHYgKyBhICogZHQgKiBkdClcblxuICAgIGludGVncmF0ZTogKHBhcnRpY2xlcywgZHQsIGRyYWcpIC0+XG5cbiAgICAgICAgcG9zID0gbmV3IFZlY3RvcigpXG5cbiAgICAgICAgZHRTcSA9IGR0ICogZHRcblxuICAgICAgICBmb3IgcCBpbiBwYXJ0aWNsZXMgd2hlbiBub3QgcC5maXhlZFxuXG4gICAgICAgICAgICAjIFNjYWxlIGZvcmNlIHRvIG1hc3MuXG4gICAgICAgICAgICBwLmFjYy5zY2FsZSBwLm1hc3NJbnZcblxuICAgICAgICAgICAgIyBEZXJpdmUgdmVsb2NpdHkuXG4gICAgICAgICAgICAocC52ZWwuY29weSBwLnBvcykuc3ViIHAub2xkLnBvc1xuXG4gICAgICAgICAgICAjIEFwcGx5IGZyaWN0aW9uLlxuICAgICAgICAgICAgaWYgZHJhZyB0aGVuIHAudmVsLnNjYWxlIGRyYWdcblxuICAgICAgICAgICAgIyBBcHBseSBmb3JjZXMgdG8gbmV3IHBvc2l0aW9uLlxuICAgICAgICAgICAgKHBvcy5jb3B5IHAucG9zKS5hZGQgKHAudmVsLmFkZCBwLmFjYy5zY2FsZSBkdFNxKVxuXG4gICAgICAgICAgICAjIFN0b3JlIG9sZCBwb3NpdGlvbi5cbiAgICAgICAgICAgIHAub2xkLnBvcy5jb3B5IHAucG9zXG5cbiAgICAgICAgICAgICMgdXBkYXRlIHBvc2l0aW9uLlxuICAgICAgICAgICAgcC5wb3MuY29weSBwb3NcblxuICAgICAgICAgICAgIyBSZXNldCBmb3JjZXMuXG4gICAgICAgICAgICBwLmFjYy5jbGVhcigpXG4iLCIjIyMgSW50ZWdyYXRvciAjIyNcblxuY2xhc3MgZXhwb3J0cy5JbnRlZ3JhdG9yXG5cbiAgICBpbnRlZ3JhdGU6IChwYXJ0aWNsZXMsIGR0KSAtPlxuXG4gICAgICAgICMgT3ZlcnJpZGUuXG4iLCIjIyMgSW1wb3J0IEludGVncmF0b3IgIyMjXG57SW50ZWdyYXRvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ludGVncmF0b3InXG5cbiMjIyBJbXByb3ZlZCBFdWxlciBJbnRlZ3JhdG9yICMjI1xuXG5jbGFzcyBleHBvcnRzLkltcHJvdmVkRXVsZXIgZXh0ZW5kcyBJbnRlZ3JhdG9yXG5cbiAgICAjIHggKz0gKHYgKiBkdCkgKyAoYSAqIDAuNSAqIGR0ICogZHQpXG4gICAgIyB2ICs9IGEgKiBkdFxuXG4gICAgaW50ZWdyYXRlOiAocGFydGljbGVzLCBkdCwgZHJhZykgLT5cblxuICAgICAgICBhY2MgPSBuZXcgVmVjdG9yKClcbiAgICAgICAgdmVsID0gbmV3IFZlY3RvcigpXG5cbiAgICAgICAgZHRTcSA9IGR0ICogZHRcblxuICAgICAgICBmb3IgcCBpbiBwYXJ0aWNsZXMgd2hlbiBub3QgcC5maXhlZFxuXG4gICAgICAgICAgICAjIFN0b3JlIHByZXZpb3VzIGxvY2F0aW9uLlxuICAgICAgICAgICAgcC5vbGQucG9zLmNvcHkgcC5wb3NcblxuICAgICAgICAgICAgIyBTY2FsZSBmb3JjZSB0byBtYXNzLlxuICAgICAgICAgICAgcC5hY2Muc2NhbGUgcC5tYXNzSW52XG5cbiAgICAgICAgICAgICMgRHVwbGljYXRlIHZlbG9jaXR5IHRvIHByZXNlcnZlIG1vbWVudHVtLlxuICAgICAgICAgICAgdmVsLmNvcHkgcC52ZWxcblxuICAgICAgICAgICAgIyBEdXBsaWNhdGUgZm9yY2UuXG4gICAgICAgICAgICBhY2MuY29weSBwLmFjY1xuXG4gICAgICAgICAgICAjIFVwZGF0ZSBwb3NpdGlvbi5cbiAgICAgICAgICAgIHAucG9zLmFkZCAodmVsLnNjYWxlIGR0KS5hZGQgKGFjYy5zY2FsZSAwLjUgKiBkdFNxKVxuXG4gICAgICAgICAgICAjIFVwZGF0ZSB2ZWxvY2l0eS5cbiAgICAgICAgICAgIHAudmVsLmFkZCBwLmFjYy5zY2FsZSBkdFxuXG4gICAgICAgICAgICAjIEFwcGx5IGZyaWN0aW9uLlxuICAgICAgICAgICAgaWYgZHJhZyB0aGVuIHAudmVsLnNjYWxlIGRyYWdcblxuICAgICAgICAgICAgIyBSZXNldCBmb3JjZXMuXG4gICAgICAgICAgICBwLmFjYy5jbGVhcigpXG4iLCIjIyMgSW1wb3J0IEludGVncmF0b3IgIyMjXG57SW50ZWdyYXRvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2VuZ2luZS9pbnRlZ3JhdG9yL0ludGVncmF0b3InXG5cbiMjIyBFdWxlciBJbnRlZ3JhdG9yICMjI1xuY2xhc3MgZXhwb3J0cy5FdWxlciBleHRlbmRzIEludGVncmF0b3JcblxuICAgICMgdiArPSBhICogZHRcbiAgICAjIHggKz0gdiAqIGR0XG5cbiAgICBpbnRlZ3JhdGU6IChwYXJ0aWNsZXMsIGR0LCBkcmFnKSAtPlxuXG4gICAgICAgIHZlbCA9IG5ldyBWZWN0b3IoKVxuXG4gICAgICAgIGZvciBwIGluIHBhcnRpY2xlcyB3aGVuIG5vdCBwLmZpeGVkXG5cbiAgICAgICAgICAgICMgU3RvcmUgcHJldmlvdXMgbG9jYXRpb24uXG4gICAgICAgICAgICBwLm9sZC5wb3MuY29weSBwLnBvc1xuXG4gICAgICAgICAgICAjIFNjYWxlIGZvcmNlIHRvIG1hc3MuXG4gICAgICAgICAgICBwLmFjYy5zY2FsZSBwLm1hc3NJbnZcblxuICAgICAgICAgICAgIyBEdXBsaWNhdGUgdmVsb2NpdHkgdG8gcHJlc2VydmUgbW9tZW50dW0uXG4gICAgICAgICAgICB2ZWwuY29weSBwLnZlbFxuXG4gICAgICAgICAgICAjIEFkZCBmb3JjZSB0byB2ZWxvY2l0eS5cbiAgICAgICAgICAgIHAudmVsLmFkZCBwLmFjYy5zY2FsZSBkdFxuXG4gICAgICAgICAgICAjIEFkZCB2ZWxvY2l0eSB0byBwb3NpdGlvbi5cbiAgICAgICAgICAgIHAucG9zLmFkZCB2ZWwuc2NhbGUgZHRcblxuICAgICAgICAgICAgIyBBcHBseSBmcmljdGlvbi5cbiAgICAgICAgICAgIGlmIGRyYWcgdGhlbiBwLnZlbC5zY2FsZSBkcmFnXG5cbiAgICAgICAgICAgICMgUmVzZXQgZm9yY2VzLlxuICAgICAgICAgICAgcC5hY2MuY2xlYXIoKVxuIiwiIyMjIEltcG9ydHMgIyMjXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cbiMjIyBTcHJpbmcgIyMjXG5cbmNsYXNzIGV4cG9ydHMuU3ByaW5nXG5cblx0Y29uc3RydWN0b3I6IChAcDEsIEBwMiwgQHJlc3RMZW5ndGggPSAxMDAsIEBzdGlmZm5lc3MgPSAxLjApIC0+XG5cblx0XHRAX2RlbHRhID0gbmV3IFZlY3RvcigpXG5cblx0IyBGID0gLWt4XG5cblx0YXBwbHk6IC0+XG5cblx0XHQoQF9kZWx0YS5jb3B5IEBwMi5wb3MpLnN1YiBAcDEucG9zXG5cblx0XHRkaXN0ID0gQF9kZWx0YS5tYWcoKSArIDAuMDAwMDAxXG5cdFx0Zm9yY2UgPSAoZGlzdCAtIEByZXN0TGVuZ3RoKSAvIChkaXN0ICogKEBwMS5tYXNzSW52ICsgQHAyLm1hc3NJbnYpKSAqIEBzdGlmZm5lc3NcblxuXHRcdGlmIG5vdCBAcDEuZml4ZWRcblxuXHRcdFx0QHAxLnBvcy5hZGQgKEBfZGVsdGEuY2xvbmUoKS5zY2FsZSBmb3JjZSAqIEBwMS5tYXNzSW52KVxuXG5cdFx0aWYgbm90IEBwMi5maXhlZFxuXG5cdFx0XHRAcDIucG9zLmFkZCAoQF9kZWx0YS5zY2FsZSAtZm9yY2UgKiBAcDIubWFzc0ludilcbiIsIiMjIyBJbXBvcnRzICMjI1xue0V1bGVyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvZW5naW5lL2ludGVncmF0b3IvRXVsZXInXG5cbiMjIyBQaHlzaWNzIEVuZ2luZSAjIyNcblxuY2xhc3MgZXhwb3J0cy5QaHlzaWNzXG5cblx0Y29uc3RydWN0b3I6IChAaW50ZWdyYXRvciA9IG5ldyBFdWxlcigpKSAtPlxuXG5cdFx0IyBGaXhlZCB0aW1lc3RlcC5cblx0XHRAdGltZXN0ZXAgPSAxLjAgLyA2MFxuXG5cdFx0IyBGcmljdGlvbiB3aXRoaW4gdGhlIHN5c3RlbS5cblx0XHRAdmlzY29zaXR5ID0gMC4wMDVcblxuXHRcdCMgR2xvYmFsIGJlaGF2aW91cnMuXG5cdFx0QGJlaGF2aW91cnMgPSBbXVxuXG5cdFx0IyBUaW1lIGluIHNlY29uZHMuXG5cdFx0QF90aW1lID0gMC4wXG5cblx0XHQjIExhc3Qgc3RlcCBkdXJhdGlvbi5cblx0XHRAX3N0ZXAgPSAwLjBcblxuXHRcdCMgQ3VycmVudCB0aW1lLlxuXHRcdEBfY2xvY2sgPSBudWxsXG5cblx0XHQjIFRpbWUgYnVmZmVyLlxuXHRcdEBfYnVmZmVyID0gMC4wXG5cblx0XHQjIE1heCBpdGVyYXRpb25zIHBlciBzdGVwLlxuXHRcdEBfbWF4U3RlcHMgPSA0XG5cblx0XHQjIFBhcnRpY2xlcyBpbiBzeXN0ZW0uXG5cdFx0QHBhcnRpY2xlcyA9IFtdXG5cblx0XHQjIFNwcmluZ3MgaW4gc3lzdGVtLlxuXHRcdEBzcHJpbmdzID0gW11cblxuXHQjIyMgUGVyZm9ybXMgYSBudW1lcmljYWwgaW50ZWdyYXRpb24gc3RlcC4gIyMjXG5cdGludGVncmF0ZTogKGR0KSAtPlxuXG5cdFx0IyBEcmFnIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdmlzY29zaXR5LlxuXHRcdGRyYWcgPSAxLjAgLSBAdmlzY29zaXR5XG5cblx0XHQjIFVwZGF0ZSBwYXJ0aWNsZXMgLyBhcHBseSBiZWhhdmlvdXJzLlxuXG5cdFx0Zm9yIHBhcnRpY2xlLCBpbmRleCBpbiBAcGFydGljbGVzXG5cblx0XHRcdGZvciBiZWhhdmlvdXIgaW4gQGJlaGF2aW91cnNcblxuXHRcdFx0XHRiZWhhdmlvdXIuYXBwbHkgcGFydGljbGUsIGR0LCBpbmRleFxuXG5cdFx0XHRwYXJ0aWNsZS51cGRhdGUgZHQsIGluZGV4XG5cblx0XHQjIEludGVncmF0ZSBtb3Rpb24uXG5cblx0XHRAaW50ZWdyYXRvci5pbnRlZ3JhdGUgQHBhcnRpY2xlcywgZHQsIGRyYWdcblxuXHRcdCMgQ29tcHV0ZSBhbGwgc3ByaW5ncy5cblxuXHRcdGZvciBzcHJpbmcgaW4gQHNwcmluZ3NcblxuXHRcdFx0c3ByaW5nLmFwcGx5KClcblxuXHQjIyMgU3RlcHMgdGhlIHN5c3RlbS4gIyMjXG5cdHN0ZXA6IC0+XG5cblx0XHQjIEluaXRpYWxpc2UgdGhlIGNsb2NrIG9uIGZpcnN0IHN0ZXAuXG5cdFx0QF9jbG9jayA/PSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXG5cdFx0IyBDb21wdXRlIGRlbHRhIHRpbWUgc2luY2UgbGFzdCBzdGVwLlxuXHRcdHRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKVxuXHRcdGRlbHRhID0gdGltZSAtIEBfY2xvY2tcblxuXHRcdCMgTm8gc3VmZmljaWVudCBjaGFuZ2UuXG5cdFx0cmV0dXJuIGlmIGRlbHRhIDw9IDAuMFxuXG5cdFx0IyBDb252ZXJ0IHRpbWUgdG8gc2Vjb25kcy5cblx0XHRkZWx0YSAqPSAwLjAwMVxuXG5cdFx0IyBVcGRhdGUgdGhlIGNsb2NrLlxuXHRcdEBfY2xvY2sgPSB0aW1lXG5cblx0XHQjIEluY3JlbWVudCB0aW1lIGJ1ZmZlci5cblx0XHRAX2J1ZmZlciArPSBkZWx0YVxuXG5cdFx0IyBJbnRlZ3JhdGUgdW50aWwgdGhlIGJ1ZmZlciBpcyBlbXB0eSBvciB1bnRpbCB0aGVcblx0XHQjIG1heGltdW0gYW1vdW50IG9mIGl0ZXJhdGlvbnMgcGVyIHN0ZXAgaXMgcmVhY2hlZC5cblxuXHRcdGkgPSAwXG5cblx0XHR3aGlsZSBAX2J1ZmZlciA+PSBAdGltZXN0ZXAgYW5kICsraSA8IEBfbWF4U3RlcHNcblxuXHRcdFx0IyBJbnRlZ3JhdGUgbW90aW9uIGJ5IGZpeGVkIHRpbWVzdGVwLlxuXHRcdFx0QGludGVncmF0ZSBAdGltZXN0ZXBcblxuXHRcdFx0IyBSZWR1Y2UgYnVmZmVyIGJ5IG9uZSB0aW1lc3RlcC5cblx0XHRcdEBfYnVmZmVyIC09IEB0aW1lc3RlcFxuXG5cdFx0XHQjIEluY3JlbWVudCBydW5uaW5nIHRpbWUuXG5cdFx0XHRAX3RpbWUgKz0gQHRpbWVzdGVwXG5cblx0XHQjIFN0b3JlIHN0ZXAgdGltZSBmb3IgZGVidWdnaW5nLlxuXHRcdEBfc3RlcCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZVxuXG5cdCMjIyBDbGVhbiB1cCBhZnRlciB5b3Vyc2VsZi4gIyMjXG5cdGRlc3Ryb3k6IC0+XG5cblx0XHRAaW50ZWdyYXRvciA9IG51bGxcblx0XHRAcGFydGljbGVzID0gbnVsbFxuXHRcdEBzcHJpbmdzID0gbnVsbFxuIiwiIyMjIEltcG9ydHMgIyMjXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cbiMjIyBQYXJ0aWNsZSAjIyNcblxuY2xhc3MgZXhwb3J0cy5QYXJ0aWNsZVxuXG5cdEBHVUlEID0gMFxuXG5cdGNvbnN0cnVjdG9yOiAoQG1hc3MgPSAxLjApIC0+XG5cblx0XHQjIFNldCBhIHVuaXF1ZSBpZC5cblx0XHRAaWQgPSAncCcgKyBQYXJ0aWNsZS5HVUlEKytcblxuXHRcdCMgU2V0IGluaXRpYWwgbWFzcy5cblx0XHRAc2V0TWFzcyBAbWFzc1xuXG5cdFx0IyBTZXQgaW5pdGlhbCByYWRpdXMuXG5cdFx0QHNldFJhZGl1cyAxLjBcblxuXHRcdCMgQXBwbHkgZm9yY2VzLlxuXHRcdEBmaXhlZCA9IGZhbHNlXG5cblx0XHQjIEJlaGF2aW91cnMgdG8gYmUgYXBwbGllZC5cblx0XHRAYmVoYXZpb3VycyA9IFtdXG5cblx0XHQjIEN1cnJlbnQgcG9zaXRpb24uXG5cdFx0QHBvcyA9IG5ldyBWZWN0b3IoKVxuXG5cdFx0IyBDdXJyZW50IHZlbG9jaXR5LlxuXHRcdEB2ZWwgPSBuZXcgVmVjdG9yKClcblxuXHRcdCMgQ3VycmVudCBmb3JjZS5cblx0XHRAYWNjID0gbmV3IFZlY3RvcigpXG5cblx0XHQjIFByZXZpb3VzIHN0YXRlLlxuXHRcdEBvbGQgPVxuXHRcdFx0cG9zOiBuZXcgVmVjdG9yKClcblx0XHRcdHZlbDogbmV3IFZlY3RvcigpXG5cdFx0XHRhY2M6IG5ldyBWZWN0b3IoKVxuXG5cdCMjIyBNb3ZlcyB0aGUgcGFydGljbGUgdG8gYSBnaXZlbiBsb2NhdGlvbiB2ZWN0b3IuICMjI1xuXHRtb3ZlVG86IChwb3MpIC0+XG5cblx0XHRAcG9zLmNvcHkgcG9zXG5cdFx0QG9sZC5wb3MuY29weSBwb3NcblxuXHQjIyMgU2V0cyB0aGUgbWFzcyBvZiB0aGUgcGFydGljbGUuICMjI1xuXHRzZXRNYXNzOiAoQG1hc3MgPSAxLjApIC0+XG5cblx0XHQjIFRoZSBpbnZlcnNlIG1hc3MuXG5cdFx0QG1hc3NJbnYgPSAxLjAgLyBAbWFzc1xuXG5cdCMjIyBTZXRzIHRoZSByYWRpdXMgb2YgdGhlIHBhcnRpY2xlLiAjIyNcblx0c2V0UmFkaXVzOiAoQHJhZGl1cyA9IDEuMCkgLT5cblxuXHRcdEByYWRpdXNTcSA9IEByYWRpdXMgKiBAcmFkaXVzXG5cblx0IyMjIEFwcGxpZXMgYWxsIGJlaGF2aW91cnMgdG8gZGVyaXZlIG5ldyBmb3JjZS4gIyMjXG5cdHVwZGF0ZTogKGR0LCBpbmRleCkgLT5cblxuXHRcdCMgQXBwbHkgYWxsIGJlaGF2aW91cnMuXG5cblx0XHRpZiBub3QgQGZpeGVkXG5cblx0XHRcdGZvciBiZWhhdmlvdXIgaW4gQGJlaGF2aW91cnNcblxuXHRcdFx0XHRiZWhhdmlvdXIuYXBwbHkgQCwgZHQsIGluZGV4XG4iLCIjIyMgV2ViR0wgUmVuZGVyZXIgIyMjXG5cbmNsYXNzIFdlYkdMUmVuZGVyZXIgZXh0ZW5kcyBSZW5kZXJlclxuXG4gICAgIyBQYXJ0aWNsZSB2ZXJ0ZXggc2hhZGVyIHNvdXJjZS5cbiAgICBAUEFSVElDTEVfVlMgPSAnJydcblxuICAgICAgICB1bmlmb3JtIHZlYzIgdmlld3BvcnQ7XG4gICAgICAgIGF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9uO1xuICAgICAgICBhdHRyaWJ1dGUgZmxvYXQgcmFkaXVzO1xuICAgICAgICBhdHRyaWJ1dGUgdmVjNCBjb2xvdXI7XG4gICAgICAgIHZhcnlpbmcgdmVjNCB0aW50O1xuXG4gICAgICAgIHZvaWQgbWFpbigpIHtcblxuICAgICAgICAgICAgLy8gY29udmVydCB0aGUgcmVjdGFuZ2xlIGZyb20gcGl4ZWxzIHRvIDAuMCB0byAxLjBcbiAgICAgICAgICAgIHZlYzIgemVyb1RvT25lID0gcG9zaXRpb24ueHkgLyB2aWV3cG9ydDtcbiAgICAgICAgICAgIHplcm9Ub09uZS55ID0gMS4wIC0gemVyb1RvT25lLnk7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgZnJvbSAwLT4xIHRvIDAtPjJcbiAgICAgICAgICAgIHZlYzIgemVyb1RvVHdvID0gemVyb1RvT25lICogMi4wO1xuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IGZyb20gMC0+MiB0byAtMS0+KzEgKGNsaXBzcGFjZSlcbiAgICAgICAgICAgIHZlYzIgY2xpcFNwYWNlID0gemVyb1RvVHdvIC0gMS4wO1xuXG4gICAgICAgICAgICB0aW50ID0gY29sb3VyO1xuXG4gICAgICAgICAgICBnbF9Qb3NpdGlvbiA9IHZlYzQoY2xpcFNwYWNlLCAwLCAxKTtcbiAgICAgICAgICAgIGdsX1BvaW50U2l6ZSA9IHJhZGl1cyAqIDIuMDtcbiAgICAgICAgfVxuICAgICcnJ1xuXG4gICAgIyBQYXJ0aWNsZSBmcmFnZW50IHNoYWRlciBzb3VyY2UuXG4gICAgQFBBUlRJQ0xFX0ZTID0gJycnXG5cbiAgICAgICAgcHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XG4gICAgICAgIFxuICAgICAgICB1bmlmb3JtIHNhbXBsZXIyRCB0ZXh0dXJlO1xuICAgICAgICB2YXJ5aW5nIHZlYzQgdGludDtcblxuICAgICAgICB2b2lkIG1haW4oKSB7XG4gICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodGV4dHVyZSwgZ2xfUG9pbnRDb29yZCkgKiB0aW50O1xuICAgICAgICB9XG4gICAgJycnXG5cbiAgICAjIFNwcmluZyB2ZXJ0ZXggc2hhZGVyIHNvdXJjZS5cbiAgICBAU1BSSU5HX1ZTID0gJycnXG5cbiAgICAgICAgdW5pZm9ybSB2ZWMyIHZpZXdwb3J0O1xuICAgICAgICBhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcblxuICAgICAgICB2b2lkIG1haW4oKSB7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgdGhlIHJlY3RhbmdsZSBmcm9tIHBpeGVscyB0byAwLjAgdG8gMS4wXG4gICAgICAgICAgICB2ZWMyIHplcm9Ub09uZSA9IHBvc2l0aW9uLnh5IC8gdmlld3BvcnQ7XG4gICAgICAgICAgICB6ZXJvVG9PbmUueSA9IDEuMCAtIHplcm9Ub09uZS55O1xuXG4gICAgICAgICAgICAvLyBjb252ZXJ0IGZyb20gMC0+MSB0byAwLT4yXG4gICAgICAgICAgICB2ZWMyIHplcm9Ub1R3byA9IHplcm9Ub09uZSAqIDIuMDtcblxuICAgICAgICAgICAgLy8gY29udmVydCBmcm9tIDAtPjIgdG8gLTEtPisxIChjbGlwc3BhY2UpXG4gICAgICAgICAgICB2ZWMyIGNsaXBTcGFjZSA9IHplcm9Ub1R3byAtIDEuMDtcblxuICAgICAgICAgICAgZ2xfUG9zaXRpb24gPSB2ZWM0KGNsaXBTcGFjZSwgMCwgMSk7XG4gICAgICAgIH1cbiAgICAnJydcblxuICAgICMgU3ByaW5nIGZyYWdlbnQgc2hhZGVyIHNvdXJjZS5cbiAgICBAU1BSSU5HX0ZTID0gJycnXG5cbiAgICAgICAgdm9pZCBtYWluKCkge1xuICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgxLjAsIDEuMCwgMS4wLCAwLjEpO1xuICAgICAgICB9XG4gICAgJycnXG5cbiAgICBjb25zdHJ1Y3RvcjogKEB1c2VQb2ludFNwcml0ZXMgPSB0cnVlKSAtPlxuXG4gICAgICAgIHN1cGVyXG5cbiAgICAgICAgQHBhcnRpY2xlUG9zaXRpb25CdWZmZXIgPSBudWxsXG4gICAgICAgIEBwYXJ0aWNsZVJhZGl1c0J1ZmZlciA9IG51bGxcbiAgICAgICAgQHBhcnRpY2xlQ29sb3VyQnVmZmVyID0gbnVsbFxuICAgICAgICBAcGFydGljbGVUZXh0dXJlID0gbnVsbFxuICAgICAgICBAcGFydGljbGVTaGFkZXIgPSBudWxsXG5cbiAgICAgICAgQHNwcmluZ1Bvc2l0aW9uQnVmZmVyID0gbnVsbFxuICAgICAgICBAc3ByaW5nU2hhZGVyID0gbnVsbFxuXG4gICAgICAgIEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICAgIFxuICAgICAgICAjIEluaXQgV2ViR0wuXG4gICAgICAgIHRyeSBAZ2wgPSBAY2FudmFzLmdldENvbnRleHQgJ2V4cGVyaW1lbnRhbC13ZWJnbCcgY2F0Y2ggZXJyb3JcbiAgICAgICAgZmluYWxseSByZXR1cm4gbmV3IENhbnZhc1JlbmRlcmVyKCkgaWYgbm90IEBnbFxuXG4gICAgICAgICMgU2V0IHRoZSBET00gZWxlbWVudC5cbiAgICAgICAgQGRvbUVsZW1lbnQgPSBAY2FudmFzXG5cbiAgICBpbml0OiAocGh5c2ljcykgLT5cblxuICAgICAgICBzdXBlciBwaHlzaWNzXG5cbiAgICAgICAgQGluaXRTaGFkZXJzKClcbiAgICAgICAgQGluaXRCdWZmZXJzIHBoeXNpY3NcblxuICAgICAgICAjIENyZWF0ZSBwYXJ0aWNsZSB0ZXh0dXJlIGZyb20gY2FudmFzLlxuICAgICAgICBAcGFydGljbGVUZXh0dXJlID0gZG8gQGNyZWF0ZVBhcnRpY2xlVGV4dHVyZURhdGFcblxuICAgICAgICAjIFVzZSBhZGRpdGl2ZSBibGVuZGluZy5cbiAgICAgICAgQGdsLmJsZW5kRnVuYyBAZ2wuU1JDX0FMUEhBLCBAZ2wuT05FXG5cbiAgICAgICAgIyBFbmFibGUgdGhlIG90aGVyIHNoaXQgd2UgbmVlZCBmcm9tIFdlYkdMLlxuICAgICAgICAjQGdsLmVuYWJsZSBAZ2wuVkVSVEVYX1BST0dSQU1fUE9JTlRfU0laRVxuICAgICAgICAjQGdsLmVuYWJsZSBAZ2wuVEVYVFVSRV8yRFxuICAgICAgICBAZ2wuZW5hYmxlIEBnbC5CTEVORFxuXG4gICAgaW5pdFNoYWRlcnM6IC0+XG5cbiAgICAgICAgIyBDcmVhdGUgc2hhZGVycy5cbiAgICAgICAgQHBhcnRpY2xlU2hhZGVyID0gQGNyZWF0ZVNoYWRlclByb2dyYW0gV2ViR0xSZW5kZXJlci5QQVJUSUNMRV9WUywgV2ViR0xSZW5kZXJlci5QQVJUSUNMRV9GU1xuICAgICAgICBAc3ByaW5nU2hhZGVyID0gQGNyZWF0ZVNoYWRlclByb2dyYW0gV2ViR0xSZW5kZXJlci5TUFJJTkdfVlMsIFdlYkdMUmVuZGVyZXIuU1BSSU5HX0ZTXG5cbiAgICAgICAgIyBTdG9yZSBwYXJ0aWNsZSBzaGFkZXIgdW5pZm9ybSBsb2NhdGlvbnMuXG4gICAgICAgIEBwYXJ0aWNsZVNoYWRlci51bmlmb3JtcyA9XG4gICAgICAgICAgICB2aWV3cG9ydDogQGdsLmdldFVuaWZvcm1Mb2NhdGlvbiBAcGFydGljbGVTaGFkZXIsICd2aWV3cG9ydCdcblxuICAgICAgICAjIFN0b3JlIHNwcmluZyBzaGFkZXIgdW5pZm9ybSBsb2NhdGlvbnMuXG4gICAgICAgIEBzcHJpbmdTaGFkZXIudW5pZm9ybXMgPVxuICAgICAgICAgICAgdmlld3BvcnQ6IEBnbC5nZXRVbmlmb3JtTG9jYXRpb24gQHNwcmluZ1NoYWRlciwgJ3ZpZXdwb3J0J1xuXG4gICAgICAgICMgU3RvcmUgcGFydGljbGUgc2hhZGVyIGF0dHJpYnV0ZSBsb2NhdGlvbnMuXG4gICAgICAgIEBwYXJ0aWNsZVNoYWRlci5hdHRyaWJ1dGVzID1cbiAgICAgICAgICAgIHBvc2l0aW9uOiBAZ2wuZ2V0QXR0cmliTG9jYXRpb24gQHBhcnRpY2xlU2hhZGVyLCAncG9zaXRpb24nXG4gICAgICAgICAgICByYWRpdXM6IEBnbC5nZXRBdHRyaWJMb2NhdGlvbiBAcGFydGljbGVTaGFkZXIsICdyYWRpdXMnXG4gICAgICAgICAgICBjb2xvdXI6IEBnbC5nZXRBdHRyaWJMb2NhdGlvbiBAcGFydGljbGVTaGFkZXIsICdjb2xvdXInXG5cbiAgICAgICAgIyBTdG9yZSBzcHJpbmcgc2hhZGVyIGF0dHJpYnV0ZSBsb2NhdGlvbnMuXG4gICAgICAgIEBzcHJpbmdTaGFkZXIuYXR0cmlidXRlcyA9XG4gICAgICAgICAgICBwb3NpdGlvbjogQGdsLmdldEF0dHJpYkxvY2F0aW9uIEBzcHJpbmdTaGFkZXIsICdwb3NpdGlvbidcblxuICAgICAgICBjb25zb2xlLmxvZyBAcGFydGljbGVTaGFkZXJcblxuICAgIGluaXRCdWZmZXJzOiAocGh5c2ljcykgLT5cblxuICAgICAgICBjb2xvdXJzID0gW11cbiAgICAgICAgcmFkaWkgPSBbXVxuXG4gICAgICAgICMgQ3JlYXRlIGJ1ZmZlcnMuXG4gICAgICAgIEBwYXJ0aWNsZVBvc2l0aW9uQnVmZmVyID0gZG8gQGdsLmNyZWF0ZUJ1ZmZlclxuICAgICAgICBAc3ByaW5nUG9zaXRpb25CdWZmZXIgPSBkbyBAZ2wuY3JlYXRlQnVmZmVyXG4gICAgICAgIEBwYXJ0aWNsZUNvbG91ckJ1ZmZlciA9IGRvIEBnbC5jcmVhdGVCdWZmZXJcbiAgICAgICAgQHBhcnRpY2xlUmFkaXVzQnVmZmVyID0gZG8gQGdsLmNyZWF0ZUJ1ZmZlclxuXG4gICAgICAgICMgQ3JlYXRlIGF0dHJpYnV0ZSBhcnJheXMuXG4gICAgICAgIGZvciBwYXJ0aWNsZSBpbiBwaHlzaWNzLnBhcnRpY2xlc1xuXG4gICAgICAgICAgICAjIEJyZWFrIHRoZSBjb2xvdXIgc3RyaW5nIGludG8gUkdCQSBjb21wb25lbnRzLlxuICAgICAgICAgICAgcmdiYSA9IChwYXJ0aWNsZS5jb2xvdXIgb3IgJyNGRkZGRkYnKS5tYXRjaCgvW1xcZEEtRl17Mn0vZ2kpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgUGFyc2UgaW50byBpbnRlZ2Vycy5cbiAgICAgICAgICAgIHIgPSAocGFyc2VJbnQgcmdiYVswXSwgMTYpIG9yIDI1NVxuICAgICAgICAgICAgZyA9IChwYXJzZUludCByZ2JhWzFdLCAxNikgb3IgMjU1XG4gICAgICAgICAgICBiID0gKHBhcnNlSW50IHJnYmFbMl0sIDE2KSBvciAyNTVcbiAgICAgICAgICAgIGEgPSAocGFyc2VJbnQgcmdiYVszXSwgMTYpIG9yIDI1NVxuXG4gICAgICAgICAgICAjIFByZXBhcmUgZm9yIGFkZGluZyB0byB0aGUgY29sb3VyIGJ1ZmZlci5cbiAgICAgICAgICAgIGNvbG91cnMucHVzaCByIC8gMjU1LCBnIC8gMjU1LCBiIC8gMjU1LCBhIC8gMjU1XG5cbiAgICAgICAgICAgICMgUHJlcGFyZSBmb3IgYWRkaW5nIHRvIHRoZSByYWRpdXMgYnVmZmVyLlxuICAgICAgICAgICAgcmFkaWkucHVzaCBwYXJ0aWNsZS5yYWRpdXMgb3IgMzJcblxuICAgICAgICAjIEluaXQgUGFydGljbGUgY29sb3VyIGJ1ZmZlci5cbiAgICAgICAgQGdsLmJpbmRCdWZmZXIgQGdsLkFSUkFZX0JVRkZFUiwgQHBhcnRpY2xlQ29sb3VyQnVmZmVyXG4gICAgICAgIEBnbC5idWZmZXJEYXRhIEBnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoY29sb3VycyksIEBnbC5TVEFUSUNfRFJBV1xuXG4gICAgICAgICMgSW5pdCBQYXJ0aWNsZSByYWRpdXMgYnVmZmVyLlxuICAgICAgICBAZ2wuYmluZEJ1ZmZlciBAZ2wuQVJSQVlfQlVGRkVSLCBAcGFydGljbGVSYWRpdXNCdWZmZXJcbiAgICAgICAgQGdsLmJ1ZmZlckRhdGEgQGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShyYWRpaSksIEBnbC5TVEFUSUNfRFJBV1xuXG4gICAgICAgICMjIGNvbnNvbGUubG9nIEBwYXJ0aWNsZUNvbG91ckJ1ZmZlclxuXG4gICAgIyBDcmVhdGVzIGEgZ2VuZXJpYyB0ZXh0dXJlIGZvciBwYXJ0aWNsZXMuXG4gICAgY3JlYXRlUGFydGljbGVUZXh0dXJlRGF0YTogKHNpemUgPSAxMjgpIC0+XG4gICAgICAgIFxuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICAgIGNhbnZhcy53aWR0aCA9IGNhbnZhcy5oZWlnaHQgPSBzaXplXG4gICAgICAgIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0ICcyZCdcbiAgICAgICAgcmFkID0gc2l6ZSAqIDAuNVxuICAgICAgICBcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgICAgIGN0eC5hcmMgcmFkLCByYWQsIHJhZCwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlXG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKVxuXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAnI0ZGRidcbiAgICAgICAgY3R4LmZpbGwoKVxuXG4gICAgICAgIHRleHR1cmUgPSBAZ2wuY3JlYXRlVGV4dHVyZSgpXG4gICAgICAgIEBzZXR1cFRleHR1cmUgdGV4dHVyZSwgY2FudmFzXG5cbiAgICAgICAgdGV4dHVyZVxuXG4gICAgIyBDcmVhdGVzIGEgV2ViR0wgdGV4dHVyZSBmcm9tIGFuIGltYWdlIHBhdGggb3IgZGF0YS5cbiAgICBsb2FkVGV4dHVyZTogKHNvdXJjZSkgLT5cblxuICAgICAgICB0ZXh0dXJlID0gQGdsLmNyZWF0ZVRleHR1cmUoKVxuICAgICAgICB0ZXh0dXJlLmltYWdlID0gbmV3IEltYWdlKClcblxuICAgICAgICB0ZXh0dXJlLmltYWdlLm9ubG9hZCA9ID0+XG5cbiAgICAgICAgICAgIEBzZXR1cFRleHR1cmUgdGV4dHVyZSwgdGV4dHVyZS5pbWFnZVxuICAgICAgICBcbiAgICAgICAgdGV4dHVyZS5pbWFnZS5zcmMgPSBzb3VyY2VcbiAgICAgICAgdGV4dHVyZVxuXG4gICAgc2V0dXBUZXh0dXJlOiAodGV4dHVyZSwgZGF0YSkgLT5cblxuICAgICAgICBAZ2wuYmluZFRleHR1cmUgQGdsLlRFWFRVUkVfMkQsIHRleHR1cmVcbiAgICAgICAgQGdsLnRleEltYWdlMkQgQGdsLlRFWFRVUkVfMkQsIDAsIEBnbC5SR0JBLCBAZ2wuUkdCQSwgQGdsLlVOU0lHTkVEX0JZVEUsIGRhdGFcbiAgICAgICAgQGdsLnRleFBhcmFtZXRlcmkgQGdsLlRFWFRVUkVfMkQsIEBnbC5URVhUVVJFX01JTl9GSUxURVIsIEBnbC5MSU5FQVJcbiAgICAgICAgQGdsLnRleFBhcmFtZXRlcmkgQGdsLlRFWFRVUkVfMkQsIEBnbC5URVhUVVJFX01BR19GSUxURVIsIEBnbC5MSU5FQVJcbiAgICAgICAgQGdsLnRleFBhcmFtZXRlcmkgQGdsLlRFWFRVUkVfMkQsIEBnbC5URVhUVVJFX1dSQVBfUywgQGdsLkNMQU1QX1RPX0VER0VcbiAgICAgICAgQGdsLnRleFBhcmFtZXRlcmkgQGdsLlRFWFRVUkVfMkQsIEBnbC5URVhUVVJFX1dSQVBfVCwgQGdsLkNMQU1QX1RPX0VER0VcbiAgICAgICAgQGdsLmdlbmVyYXRlTWlwbWFwIEBnbC5URVhUVVJFXzJEXG4gICAgICAgIEBnbC5iaW5kVGV4dHVyZSBAZ2wuVEVYVFVSRV8yRCwgbnVsbFxuXG4gICAgICAgIHRleHR1cmVcblxuICAgICMgQ3JlYXRlcyBhIHNoYWRlciBwcm9ncmFtIGZyb20gdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlcy5cbiAgICBjcmVhdGVTaGFkZXJQcm9ncmFtOiAoX3ZzLCBfZnMpIC0+XG5cbiAgICAgICAgdnMgPSBAZ2wuY3JlYXRlU2hhZGVyIEBnbC5WRVJURVhfU0hBREVSXG4gICAgICAgIGZzID0gQGdsLmNyZWF0ZVNoYWRlciBAZ2wuRlJBR01FTlRfU0hBREVSXG5cbiAgICAgICAgQGdsLnNoYWRlclNvdXJjZSB2cywgX3ZzXG4gICAgICAgIEBnbC5zaGFkZXJTb3VyY2UgZnMsIF9mc1xuXG4gICAgICAgIEBnbC5jb21waWxlU2hhZGVyIHZzXG4gICAgICAgIEBnbC5jb21waWxlU2hhZGVyIGZzXG5cbiAgICAgICAgaWYgbm90IEBnbC5nZXRTaGFkZXJQYXJhbWV0ZXIgdnMsIEBnbC5DT01QSUxFX1NUQVRVU1xuICAgICAgICAgICAgYWxlcnQgQGdsLmdldFNoYWRlckluZm9Mb2cgdnNcbiAgICAgICAgICAgIG51bGxcblxuICAgICAgICBpZiBub3QgQGdsLmdldFNoYWRlclBhcmFtZXRlciBmcywgQGdsLkNPTVBJTEVfU1RBVFVTXG4gICAgICAgICAgICBhbGVydCBAZ2wuZ2V0U2hhZGVySW5mb0xvZyBmc1xuICAgICAgICAgICAgbnVsbFxuXG4gICAgICAgIHByb2cgPSBkbyBAZ2wuY3JlYXRlUHJvZ3JhbVxuXG4gICAgICAgIEBnbC5hdHRhY2hTaGFkZXIgcHJvZywgdnNcbiAgICAgICAgQGdsLmF0dGFjaFNoYWRlciBwcm9nLCBmc1xuICAgICAgICBAZ2wubGlua1Byb2dyYW0gcHJvZ1xuXG4gICAgICAgICMjIGNvbnNvbGUubG9nICdWZXJ0ZXggU2hhZGVyIENvbXBpbGVkJywgQGdsLmdldFNoYWRlclBhcmFtZXRlciB2cywgQGdsLkNPTVBJTEVfU1RBVFVTXG4gICAgICAgICMjIGNvbnNvbGUubG9nICdGcmFnbWVudCBTaGFkZXIgQ29tcGlsZWQnLCBAZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyIGZzLCBAZ2wuQ09NUElMRV9TVEFUVVNcbiAgICAgICAgIyMgY29uc29sZS5sb2cgJ1Byb2dyYW0gTGlua2VkJywgQGdsLmdldFByb2dyYW1QYXJhbWV0ZXIgcHJvZywgQGdsLkxJTktfU1RBVFVTXG5cbiAgICAgICAgcHJvZ1xuXG4gICAgIyBTZXRzIHRoZSBzaXplIG9mIHRoZSB2aWV3cG9ydC5cbiAgICBzZXRTaXplOiAoQHdpZHRoLCBAaGVpZ2h0KSA9PlxuXG4gICAgICAgICMjIGNvbnNvbGUubG9nICdyZXNpemUnLCBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICBAY2FudmFzLndpZHRoID0gQHdpZHRoXG4gICAgICAgIEBjYW52YXMuaGVpZ2h0ID0gQGhlaWdodFxuICAgICAgICBAZ2wudmlld3BvcnQgMCwgMCwgQHdpZHRoLCBAaGVpZ2h0XG5cbiAgICAgICAgIyBVcGRhdGUgc2hhZGVyIHVuaWZvcm1zLlxuICAgICAgICBAZ2wudXNlUHJvZ3JhbSBAcGFydGljbGVTaGFkZXJcbiAgICAgICAgQGdsLnVuaWZvcm0yZnYgQHBhcnRpY2xlU2hhZGVyLnVuaWZvcm1zLnZpZXdwb3J0LCBuZXcgRmxvYXQzMkFycmF5IFtAd2lkdGgsIEBoZWlnaHRdXG5cbiAgICAgICAgIyBVcGRhdGUgc2hhZGVyIHVuaWZvcm1zLlxuICAgICAgICBAZ2wudXNlUHJvZ3JhbSBAc3ByaW5nU2hhZGVyXG4gICAgICAgIEBnbC51bmlmb3JtMmZ2IEBzcHJpbmdTaGFkZXIudW5pZm9ybXMudmlld3BvcnQsIG5ldyBGbG9hdDMyQXJyYXkgW0B3aWR0aCwgQGhlaWdodF1cblxuICAgICMgUmVuZGVycyB0aGUgY3VycmVudCBwaHlzaWNzIHN0YXRlLlxuICAgIHJlbmRlcjogKHBoeXNpY3MpIC0+XG5cbiAgICAgICAgc3VwZXJcblxuICAgICAgICAjIENsZWFyIHRoZSB2aWV3cG9ydC5cbiAgICAgICAgQGdsLmNsZWFyIEBnbC5DT0xPUl9CVUZGRVJfQklUIHwgQGdsLkRFUFRIX0JVRkZFUl9CSVRcblxuICAgICAgICAjIERyYXcgcGFydGljbGVzLlxuICAgICAgICBpZiBAcmVuZGVyUGFydGljbGVzXG5cbiAgICAgICAgICAgIHZlcnRpY2VzID0gW11cblxuICAgICAgICAgICAgIyBVcGRhdGUgcGFydGljbGUgcG9zaXRpb25zLlxuICAgICAgICAgICAgZm9yIHAgaW4gcGh5c2ljcy5wYXJ0aWNsZXNcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoIHAucG9zLngsIHAucG9zLnksIDAuMFxuXG4gICAgICAgICAgICAjIEJpbmQgdGhlIHBhcnRpY2xlIHRleHR1cmUuXG4gICAgICAgICAgICBAZ2wuYWN0aXZlVGV4dHVyZSBAZ2wuVEVYVFVSRTBcbiAgICAgICAgICAgIEBnbC5iaW5kVGV4dHVyZSBAZ2wuVEVYVFVSRV8yRCwgQHBhcnRpY2xlVGV4dHVyZVxuXG4gICAgICAgICAgICAjIFVzZSB0aGUgcGFydGljbGUgcHJvZ3JhbS5cbiAgICAgICAgICAgIEBnbC51c2VQcm9ncmFtIEBwYXJ0aWNsZVNoYWRlclxuXG4gICAgICAgICAgICAjIFNldHVwIHZlcnRpY2VzLlxuICAgICAgICAgICAgQGdsLmJpbmRCdWZmZXIgQGdsLkFSUkFZX0JVRkZFUiwgQHBhcnRpY2xlUG9zaXRpb25CdWZmZXJcbiAgICAgICAgICAgIEBnbC5idWZmZXJEYXRhIEBnbC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpLCBAZ2wuU1RBVElDX0RSQVdcbiAgICAgICAgICAgIEBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyIEBwYXJ0aWNsZVNoYWRlci5hdHRyaWJ1dGVzLnBvc2l0aW9uLCAzLCBAZ2wuRkxPQVQsIGZhbHNlLCAwLCAwXG4gICAgICAgICAgICBAZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMucG9zaXRpb25cblxuICAgICAgICAgICAgIyBTZXR1cCBjb2xvdXJzLlxuICAgICAgICAgICAgQGdsLmJpbmRCdWZmZXIgQGdsLkFSUkFZX0JVRkZFUiwgQHBhcnRpY2xlQ29sb3VyQnVmZmVyXG4gICAgICAgICAgICBAZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMuY29sb3VyXG4gICAgICAgICAgICBAZ2wudmVydGV4QXR0cmliUG9pbnRlciBAcGFydGljbGVTaGFkZXIuYXR0cmlidXRlcy5jb2xvdXIsIDQsIEBnbC5GTE9BVCwgZmFsc2UsIDAsIDBcblxuICAgICAgICAgICAgIyBTZXR1cCByYWRpaS5cbiAgICAgICAgICAgIEBnbC5iaW5kQnVmZmVyIEBnbC5BUlJBWV9CVUZGRVIsIEBwYXJ0aWNsZVJhZGl1c0J1ZmZlclxuICAgICAgICAgICAgQGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5IEBwYXJ0aWNsZVNoYWRlci5hdHRyaWJ1dGVzLnJhZGl1c1xuICAgICAgICAgICAgQGdsLnZlcnRleEF0dHJpYlBvaW50ZXIgQHBhcnRpY2xlU2hhZGVyLmF0dHJpYnV0ZXMucmFkaXVzLCAxLCBAZ2wuRkxPQVQsIGZhbHNlLCAwLCAwXG5cbiAgICAgICAgICAgICMgRHJhdyBwYXJ0aWNsZXMuXG4gICAgICAgICAgICBAZ2wuZHJhd0FycmF5cyBAZ2wuUE9JTlRTLCAwLCB2ZXJ0aWNlcy5sZW5ndGggLyAzXG5cbiAgICAgICAgIyBEcmF3IHNwcmluZ3MuXG4gICAgICAgIGlmIEByZW5kZXJTcHJpbmdzIGFuZCBwaHlzaWNzLnNwcmluZ3MubGVuZ3RoID4gMFxuXG4gICAgICAgICAgICB2ZXJ0aWNlcyA9IFtdXG5cbiAgICAgICAgICAgICMgVXBkYXRlIHNwcmluZyBwb3NpdGlvbnMuXG4gICAgICAgICAgICBmb3IgcyBpbiBwaHlzaWNzLnNwcmluZ3NcbiAgICAgICAgICAgICAgICB2ZXJ0aWNlcy5wdXNoIHMucDEucG9zLngsIHMucDEucG9zLnksIDAuMFxuICAgICAgICAgICAgICAgIHZlcnRpY2VzLnB1c2ggcy5wMi5wb3MueCwgcy5wMi5wb3MueSwgMC4wXG5cbiAgICAgICAgICAgICMgVXNlIHRoZSBzcHJpbmcgcHJvZ3JhbS5cbiAgICAgICAgICAgIEBnbC51c2VQcm9ncmFtIEBzcHJpbmdTaGFkZXJcblxuICAgICAgICAgICAgIyBTZXR1cCB2ZXJ0aWNlcy5cbiAgICAgICAgICAgIEBnbC5iaW5kQnVmZmVyIEBnbC5BUlJBWV9CVUZGRVIsIEBzcHJpbmdQb3NpdGlvbkJ1ZmZlclxuICAgICAgICAgICAgQGdsLmJ1ZmZlckRhdGEgQGdsLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcyksIEBnbC5TVEFUSUNfRFJBV1xuICAgICAgICAgICAgQGdsLnZlcnRleEF0dHJpYlBvaW50ZXIgQHNwcmluZ1NoYWRlci5hdHRyaWJ1dGVzLnBvc2l0aW9uLCAzLCBAZ2wuRkxPQVQsIGZhbHNlLCAwLCAwXG4gICAgICAgICAgICBAZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgQHNwcmluZ1NoYWRlci5hdHRyaWJ1dGVzLnBvc2l0aW9uXG5cbiAgICAgICAgICAgICMgRHJhdyBzcHJpbmdzLlxuICAgICAgICAgICAgQGdsLmRyYXdBcnJheXMgQGdsLkxJTkVTLCAwLCB2ZXJ0aWNlcy5sZW5ndGggLyAzXG5cbiAgICBkZXN0cm95OiAtPlxuXG4gICAgICAgICMjIGNvbnNvbGUubG9nICdEZXN0cm95J1xuIiwiIyMjIEJhc2UgUmVuZGVyZXIgIyMjXG5jbGFzcyBSZW5kZXJlclxuXG4gICAgY29uc3RydWN0b3I6IC0+XG5cbiAgICAgICAgQHdpZHRoID0gMFxuICAgICAgICBAaGVpZ2h0ID0gMFxuXG4gICAgICAgIEByZW5kZXJQYXJ0aWNsZXMgPSB0cnVlXG4gICAgICAgIEByZW5kZXJTcHJpbmdzID0gdHJ1ZVxuICAgICAgICBAcmVuZGVyTW91c2UgPSB0cnVlXG4gICAgICAgIEBpbml0aWFsaXplZCA9IGZhbHNlXG4gICAgICAgIEByZW5kZXJUaW1lID0gMFxuXG4gICAgaW5pdDogKHBoeXNpY3MpIC0+XG5cbiAgICAgICAgQGluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgcmVuZGVyOiAocGh5c2ljcykgLT5cblxuICAgICAgICBpZiBub3QgQGluaXRpYWxpemVkIHRoZW4gQGluaXQgcGh5c2ljc1xuXG4gICAgc2V0U2l6ZTogKEB3aWR0aCwgQGhlaWdodCkgPT5cblxuICAgIGRlc3Ryb3k6IC0+XG5cbiAgICAgICAgXG4iLCIjIyMgRE9NIFJlbmRlcmVyICMjI1xuIyMjXG5cblx0VXBkYXRpbmcgc3R5bGVzOlxuXG5cdE5vZGVzXG5cbiMjI1xuY2xhc3MgRE9NUmVuZGVyZXIgZXh0ZW5kcyBSZW5kZXJlclxuXG5cdGNvbnN0cnVjdG9yOiAtPlxuXG5cdFx0c3VwZXJcblxuXHRcdEB1c2VHUFUgPSB5ZXNcblx0XHRcblx0XHRAZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2Rpdidcblx0XHRAY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnY2FudmFzJ1xuXHRcdEBjdHggPSBAY2FudmFzLmdldENvbnRleHQgJzJkJ1xuXG5cdFx0QGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcblx0XHRAY2FudmFzLnN0eWxlLmxlZnQgPSAwXG5cdFx0QGNhbnZhcy5zdHlsZS50b3AgPSAwXG5cblx0XHRAZG9tRWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXG5cdFx0QGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQgQGNhbnZhc1xuXG5cdGluaXQ6IChwaHlzaWNzKSAtPlxuXG5cdFx0c3VwZXIgcGh5c2ljc1xuXG5cdFx0IyBTZXQgdXAgcGFydGljbGUgRE9NIGVsZW1lbnRzXG5cdFx0Zm9yIHAgaW4gcGh5c2ljcy5wYXJ0aWNsZXNcblxuXHRcdFx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdzcGFuJ1xuXHRcdFx0c3QgPSBlbC5zdHlsZVxuXG5cdFx0XHRzdC5iYWNrZ3JvdW5kQ29sb3IgPSBwLmNvbG91clxuXHRcdFx0c3QuYm9yZGVyUmFkaXVzID0gcC5yYWRpdXNcblx0XHRcdHN0Lm1hcmdpbkxlZnQgPSAtcC5yYWRpdXNcblx0XHRcdHN0Lm1hcmdpblRvcCA9IC1wLnJhZGl1c1xuXHRcdFx0c3QucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0XHRzdC5kaXNwbGF5ID0gJ2Jsb2NrJ1xuXHRcdFx0c3Qub3BhY2l0eSA9IDAuODVcblx0XHRcdHN0LmhlaWdodCA9IHAucmFkaXVzICogMlxuXHRcdFx0c3Qud2lkdGggPSBwLnJhZGl1cyAqIDJcblxuXHRcdFx0QGRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQgZWxcblx0XHRcdHAuZG9tRWxlbWVudCA9IGVsXG5cblx0XHQjIFNldCB1cCBtb3VzZSBET00gZWxlbWVudFxuXHRcdGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCAnc3Bhbidcblx0XHRzdCA9IGVsLnN0eWxlXG5cdFx0bXIgPSAyMFxuXG5cdFx0c3QuYmFja2dyb3VuZENvbG9yID0gJyNmZmZmZmYnXG5cdFx0c3QuYm9yZGVyUmFkaXVzID0gbXJcblx0XHRzdC5tYXJnaW5MZWZ0ID0gLW1yXG5cdFx0c3QubWFyZ2luVG9wID0gLW1yXG5cdFx0c3QucG9zaXRpb24gPSAnYWJzb2x1dGUnXG5cdFx0c3QuZGlzcGxheSA9ICdibG9jaydcblx0XHRzdC5vcGFjaXR5ID0gMC4xXG5cdFx0c3QuaGVpZ2h0ID0gbXIgKiAyXG5cdFx0c3Qud2lkdGggPSBtciAqIDJcblxuXHRcdEBkb21FbGVtZW50LmFwcGVuZENoaWxkIGVsXG5cdFx0QG1vdXNlLmRvbUVsZW1lbnQgPSBlbFxuXG5cdHJlbmRlcjogKHBoeXNpY3MpIC0+XG5cblx0XHRzdXBlciBwaHlzaWNzXG5cblx0XHR0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblxuXHRcdGlmIEByZW5kZXJQYXJ0aWNsZXNcblxuXHRcdFx0Zm9yIHAgaW4gcGh5c2ljcy5wYXJ0aWNsZXNcblxuXHRcdFx0XHRpZiBAdXNlR1BVXG5cblx0XHRcdFx0XHRwLmRvbUVsZW1lbnQuc3R5bGUuV2Via2l0VHJhbnNmb3JtID0gXCJcIlwiXG5cdFx0XHRcdFx0XHR0cmFuc2xhdGUzZCgje3AucG9zLnh8MH1weCwje3AucG9zLnl8MH1weCwwcHgpXG5cdFx0XHRcdFx0XHRcIlwiXCJcblx0XHRcdFx0ZWxzZVxuXG5cdFx0XHRcdFx0cC5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSBwLnBvcy54XG5cdFx0XHRcdFx0cC5kb21FbGVtZW50LnN0eWxlLnRvcCA9IHAucG9zLnlcblxuXHRcdGlmIEByZW5kZXJTcHJpbmdzXG5cblx0XHRcdEBjYW52YXMud2lkdGggPSBAY2FudmFzLndpZHRoXG5cblx0XHRcdEBjdHguc3Ryb2tlU3R5bGUgPSAncmdiYSgyNTUsMjU1LDI1NSwwLjEpJ1xuXHRcdFx0QGN0eC5iZWdpblBhdGgoKVxuXG5cdFx0XHRmb3IgcyBpbiBwaHlzaWNzLnNwcmluZ3Ncblx0XHRcdFx0QGN0eC5tb3ZlVG8ocy5wMS5wb3MueCwgcy5wMS5wb3MueSlcblx0XHRcdFx0QGN0eC5saW5lVG8ocy5wMi5wb3MueCwgcy5wMi5wb3MueSlcblx0XHRcdFxuXHRcdFx0QGN0eC5zdHJva2UoKVxuXG5cdFx0aWYgQHJlbmRlck1vdXNlXG5cblx0XHRcdGlmIEB1c2VHUFVcblxuXHRcdFx0XHRAbW91c2UuZG9tRWxlbWVudC5zdHlsZS5XZWJraXRUcmFuc2Zvcm0gPSBcIlwiXCJcblx0XHRcdFx0XHR0cmFuc2xhdGUzZCgje0Btb3VzZS5wb3MueHwwfXB4LCN7QG1vdXNlLnBvcy55fDB9cHgsMHB4KVxuXHRcdFx0XHRcdFwiXCJcIlxuXHRcdFx0ZWxzZVxuXG5cdFx0XHRcdEBtb3VzZS5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSBAbW91c2UucG9zLnhcblx0XHRcdFx0QG1vdXNlLmRvbUVsZW1lbnQuc3R5bGUudG9wID0gQG1vdXNlLnBvcy55XG5cblx0XHRAcmVuZGVyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZVxuXG5cdHNldFNpemU6IChAd2lkdGgsIEBoZWlnaHQpID0+XG5cbiAgICAgICAgc3VwZXIgQHdpZHRoLCBAaGVpZ2h0XG5cbiAgICAgICAgQGNhbnZhcy53aWR0aCA9IEB3aWR0aFxuICAgICAgICBAY2FudmFzLmhlaWdodCA9IEBoZWlnaHRcblxuICAgIGRlc3Ryb3k6IC0+XG5cbiAgICBcdHdoaWxlIEBkb21FbGVtZW50Lmhhc0NoaWxkTm9kZXMoKVxuICAgIFx0XHRAZG9tRWxlbWVudC5yZW1vdmVDaGlsZCBAZG9tRWxlbWVudC5sYXN0Q2hpbGRcbiIsIiMjIyBDYW52YXMgUmVuZGVyZXIgIyMjXG5jbGFzcyBDYW52YXNSZW5kZXJlciBleHRlbmRzIFJlbmRlcmVyXG5cbiAgICBjb25zdHJ1Y3RvcjogLT5cblxuICAgICAgICBzdXBlclxuXG4gICAgICAgIEBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICdjYW52YXMnXG4gICAgICAgIEBjdHggPSBAY2FudmFzLmdldENvbnRleHQgJzJkJ1xuXG4gICAgICAgICMgU2V0IHRoZSBET00gZWxlbWVudC5cbiAgICAgICAgQGRvbUVsZW1lbnQgPSBAY2FudmFzXG5cbiAgICBpbml0OiAocGh5c2ljcykgLT5cblxuICAgICAgICBzdXBlciBwaHlzaWNzXG5cbiAgICByZW5kZXI6IChwaHlzaWNzKSAtPlxuXG4gICAgICAgIHN1cGVyIHBoeXNpY3NcblxuICAgICAgICB0aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKClcblxuICAgICAgICAjIERyYXcgdmVsb2NpdHkuXG4gICAgICAgIHZlbCA9IG5ldyBWZWN0b3IoKVxuXG4gICAgICAgICMgRHJhdyBoZWFkaW5nLlxuICAgICAgICBkaXIgPSBuZXcgVmVjdG9yKClcblxuICAgICAgICAjIENsZWFyIGNhbnZhcy5cbiAgICAgICAgQGNhbnZhcy53aWR0aCA9IEBjYW52YXMud2lkdGhcblxuICAgICAgICBAY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdsaWdodGVyJ1xuICAgICAgICBAY3R4LmxpbmVXaWR0aCA9IDFcblxuICAgICAgICAjIERyYXcgcGFydGljbGVzLlxuICAgICAgICBpZiBAcmVuZGVyUGFydGljbGVzXG5cbiAgICAgICAgICAgIFRXT19QSSA9IE1hdGguUEkgKiAyXG4gICAgICAgIFxuICAgICAgICAgICAgZm9yIHAgaW4gcGh5c2ljcy5wYXJ0aWNsZXNcblxuICAgICAgICAgICAgICAgIEBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgICAgICBAY3R4LmFyYyhwLnBvcy54LCBwLnBvcy55LCBwLnJhZGl1cywgMCwgVFdPX1BJLCBubylcblxuICAgICAgICAgICAgICAgIEBjdHguZmlsbFN0eWxlID0gJyMnICsgKHAuY29sb3VyIG9yICdGRkZGRkYnKVxuICAgICAgICAgICAgICAgIEBjdHguZmlsbCgpXG5cbiAgICAgICAgaWYgQHJlbmRlclNwcmluZ3NcbiAgICAgICAgXG4gICAgICAgICAgICBAY3R4LnN0cm9rZVN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC4xKSdcbiAgICAgICAgICAgIEBjdHguYmVnaW5QYXRoKClcblxuICAgICAgICAgICAgZm9yIHMgaW4gcGh5c2ljcy5zcHJpbmdzXG4gICAgICAgICAgICAgICAgQGN0eC5tb3ZlVG8ocy5wMS5wb3MueCwgcy5wMS5wb3MueSlcbiAgICAgICAgICAgICAgICBAY3R4LmxpbmVUbyhzLnAyLnBvcy54LCBzLnAyLnBvcy55KVxuXG4gICAgICAgICAgICBAY3R4LnN0cm9rZSgpXG5cbiAgICAgICAgaWYgQHJlbmRlck1vdXNlXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICMgRHJhdyBtb3VzZS5cbiAgICAgICAgICAgIEBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LDI1NSwyNTUsMC4xKSdcbiAgICAgICAgICAgIEBjdHguYmVnaW5QYXRoKClcbiAgICAgICAgICAgIEBjdHguYXJjKEBtb3VzZS5wb3MueCwgQG1vdXNlLnBvcy55LCAyMCwgMCwgVFdPX1BJKVxuICAgICAgICAgICAgQGN0eC5maWxsKClcblxuICAgICAgICBAcmVuZGVyVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGltZVxuXG4gICAgc2V0U2l6ZTogKEB3aWR0aCwgQGhlaWdodCkgPT5cblxuICAgICAgICBzdXBlciBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICBAY2FudmFzLndpZHRoID0gQHdpZHRoXG4gICAgICAgIEBjYW52YXMuaGVpZ2h0ID0gQGhlaWdodFxuIiwiIyMjIERlbW8gIyMjXG5jbGFzcyBEZW1vXG5cblx0QENPTE9VUlMgPSBbJ0RDMDA0OCcsICdGMTQ2NDYnLCAnNEFFNkE5JywgJzdDRkYzRicsICc0RUM5RDknLCAnRTQyNzJFJ11cblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdEBwaHlzaWNzID0gbmV3IFBoeXNpY3MoKVxuXHRcdEBtb3VzZSA9IG5ldyBQYXJ0aWNsZSgpXG5cdFx0QG1vdXNlLmZpeGVkID0gdHJ1ZVxuXHRcdEBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHRcblx0XHRAd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aFxuXG5cdFx0QHJlbmRlclRpbWUgPSAwXG5cdFx0QGNvdW50ZXIgPSAwXG5cblx0c2V0dXA6IChmdWxsID0geWVzKSAtPlxuXG5cdFx0IyMjIE92ZXJyaWRlIGFuZCBhZGQgcGF0aWNsZXMgLyBzcHJpbmdzIGhlcmUgIyMjXG5cblx0IyMjIEluaXRpYWxpc2UgdGhlIGRlbW8gKG92ZXJyaWRlKS4gIyMjXG5cdGluaXQ6IChAY29udGFpbmVyLCBAcmVuZGVyZXIgPSBuZXcgV2ViR0xSZW5kZXJlcigpKSAtPlxuXG5cdFx0IyBCdWlsZCB0aGUgc2NlbmUuXG5cdFx0QHNldHVwIHJlbmRlcmVyLmdsP1xuXG5cdFx0IyBHaXZlIHRoZSBwYXJ0aWNsZXMgcmFuZG9tIGNvbG91cnMuXG5cdFx0Zm9yIHBhcnRpY2xlIGluIEBwaHlzaWNzLnBhcnRpY2xlc1xuXHRcdFx0cGFydGljbGUuY29sb3VyID89IFJhbmRvbS5pdGVtIERlbW8uQ09MT1VSU1xuXG5cdFx0IyBBZGQgZXZlbnQgaGFuZGxlcnMuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgQG1vdXNlbW92ZSwgZmFsc2Vcblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlLCBmYWxzZVxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIEByZXNpemUsIGZhbHNlXG5cblx0XHQjIEFkZCB0byByZW5kZXIgb3V0cHV0IHRvIHRoZSBET00uXG5cdFx0QGNvbnRhaW5lci5hcHBlbmRDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXG5cdFx0IyBQcmVwYXJlIHRoZSByZW5kZXJlci5cblx0XHRAcmVuZGVyZXIubW91c2UgPSBAbW91c2Vcblx0XHRAcmVuZGVyZXIuaW5pdCBAcGh5c2ljc1xuXG5cdFx0IyBSZXNpemUgZm9yIHRoZSBzYWtlIG9mIHRoZSByZW5kZXJlci5cblx0XHRkbyBAcmVzaXplXG5cblx0IyMjIEhhbmRsZXIgZm9yIHdpbmRvdyByZXNpemUgZXZlbnQuICMjI1xuXHRyZXNpemU6IChldmVudCkgPT5cblxuXHRcdEB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoXG5cdFx0QGhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodFxuXHRcdEByZW5kZXJlci5zZXRTaXplIEB3aWR0aCwgQGhlaWdodFxuXG5cdCMjIyBVcGRhdGUgbG9vcC4gIyMjXG5cdHN0ZXA6IC0+XG5cblx0XHQjY29uc29sZS5wcm9maWxlICdwaHlzaWNzJ1xuXG5cdFx0IyBTdGVwIHBoeXNpY3MuXG5cdFx0ZG8gQHBoeXNpY3Muc3RlcFxuXG5cdFx0I2NvbnNvbGUucHJvZmlsZUVuZCgpXG5cblx0XHQjY29uc29sZS5wcm9maWxlICdyZW5kZXInXG5cblx0XHQjIFJlbmRlci5cblxuXHRcdCMgUmVuZGVyIGV2ZXJ5IGZyYW1lIGZvciBXZWJHTCwgb3IgZXZlcnkgMyBmcmFtZXMgZm9yIGNhbnZhcy5cblx0XHRAcmVuZGVyZXIucmVuZGVyIEBwaHlzaWNzIGlmIEByZW5kZXJlci5nbD8gb3IgKytAY291bnRlciAlIDMgaXMgMFxuXG5cdFx0I2NvbnNvbGUucHJvZmlsZUVuZCgpXG5cblx0IyMjIENsZWFuIHVwIGFmdGVyIHlvdXJzZWxmLiAjIyNcblx0ZGVzdHJveTogLT5cblxuXHRcdCMjIGNvbnNvbGUubG9nIEAsICdkZXN0cm95J1xuXG5cdFx0IyBSZW1vdmUgZXZlbnQgaGFuZGxlcnMuXG5cdFx0ZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciAndG91Y2htb3ZlJywgQG1vdXNlbW92ZSwgZmFsc2Vcblx0XHRkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZW1vdmUnLCBAbW91c2Vtb3ZlLCBmYWxzZVxuXHRcdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ3Jlc2l6ZScsIEByZXNpemUsIGZhbHNlXG5cblx0XHQjIFJlbW92ZSB0aGUgcmVuZGVyIG91dHB1dCBmcm9tIHRoZSBET00uXG5cdFx0dHJ5IGNvbnRhaW5lci5yZW1vdmVDaGlsZCBAcmVuZGVyZXIuZG9tRWxlbWVudFxuXHRcdGNhdGNoIGVycm9yXG5cblx0XHRkbyBAcmVuZGVyZXIuZGVzdHJveVxuXHRcdGRvIEBwaHlzaWNzLmRlc3Ryb3lcblxuXHRcdEByZW5kZXJlciA9IG51bGxcblx0XHRAcGh5c2ljcyA9IG51bGxcblx0XHRAbW91c2UgPSBudWxsXG5cblx0IyMjIEhhbmRsZXIgZm9yIHdpbmRvdyBtb3VzZW1vdmUgZXZlbnQuICMjI1xuXHRtb3VzZW1vdmU6IChldmVudCkgPT5cblxuXHRcdGRvIGV2ZW50LnByZXZlbnREZWZhdWx0XG5cblx0XHRpZiBldmVudC50b3VjaGVzIGFuZCAhIWV2ZW50LnRvdWNoZXMubGVuZ3RoXG5cdFx0XHRcblx0XHRcdHRvdWNoID0gZXZlbnQudG91Y2hlc1swXVxuXHRcdFx0QG1vdXNlLnBvcy5zZXQgdG91Y2gucGFnZVgsIHRvdWNoLnBhZ2VZXG5cblx0XHRlbHNlXG5cblx0XHRcdEBtb3VzZS5wb3Muc2V0IGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFlcbiIsIiMjIyBDb2xsaXNpb25EZW1vICMjI1xuY2xhc3MgQ29sbGlzaW9uRGVtbyBleHRlbmRzIERlbW9cblxuICAgIHNldHVwOiAoZnVsbCA9IHllcykgLT5cblxuICAgICAgICBzdXBlclxuXG4gICAgICAgICMgVmVybGV0IGdpdmVzIHVzIGNvbGxpc2lvbiByZXNwb25jZSBmb3IgZnJlZSFcbiAgICAgICAgQHBoeXNpY3MuaW50ZWdyYXRvciA9IG5ldyBWZXJsZXQoKVxuXG4gICAgICAgIG1pbiA9IG5ldyBWZWN0b3IgMC4wLCAwLjBcbiAgICAgICAgbWF4ID0gbmV3IFZlY3RvciBAd2lkdGgsIEBoZWlnaHRcblxuICAgICAgICBib3VuZHMgPSBuZXcgRWRnZUJvdW5jZSBtaW4sIG1heFxuICAgICAgICBjb2xsaWRlID0gbmV3IENvbGxpc2lvblxuICAgICAgICBhdHRyYWN0aW9uID0gbmV3IEF0dHJhY3Rpb24gQG1vdXNlLnBvcywgMjAwMCwgMTQwMFxuXG4gICAgICAgIG1heCA9IGlmIGZ1bGwgdGhlbiAzNTAgZWxzZSAxNTBcbiAgICAgICAgcHJvYiA9IGlmIGZ1bGwgdGhlbiAwLjM1IGVsc2UgMC41XG5cbiAgICAgICAgZm9yIGkgaW4gWzAuLm1heF1cblxuICAgICAgICAgICAgcCA9IG5ldyBQYXJ0aWNsZSAoUmFuZG9tIDAuNSwgNC4wKVxuICAgICAgICAgICAgcC5zZXRSYWRpdXMgcC5tYXNzICogNFxuXG4gICAgICAgICAgICBwLm1vdmVUbyBuZXcgVmVjdG9yIChSYW5kb20gQHdpZHRoKSwgKFJhbmRvbSBAaGVpZ2h0KVxuXG4gICAgICAgICAgICAjIENvbm5lY3QgdG8gc3ByaW5nIG9yIG1vdmUgZnJlZS5cbiAgICAgICAgICAgIGlmIFJhbmRvbS5ib29sIHByb2JcbiAgICAgICAgICAgICAgICBzID0gbmV3IFNwcmluZyBAbW91c2UsIHAsIChSYW5kb20gMTIwLCAxODApLCAwLjhcbiAgICAgICAgICAgICAgICBAcGh5c2ljcy5zcHJpbmdzLnB1c2ggc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIGF0dHJhY3Rpb25cblxuICAgICAgICAgICAgIyBBZGQgcGFydGljbGUgdG8gY29sbGlzaW9uIHBvb2wuXG4gICAgICAgICAgICBjb2xsaWRlLnBvb2wucHVzaCBwXG5cbiAgICAgICAgICAgICMgQWxsb3cgcGFydGljbGUgdG8gY29sbGlkZS5cbiAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIGNvbGxpZGVcbiAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIGJvdW5kc1xuXG4gICAgICAgICAgICBAcGh5c2ljcy5wYXJ0aWNsZXMucHVzaCBwXG5cbiAgICBvbkNvbGxpc2lvbjogKHAxLCBwMikgPT5cblxuICAgICAgICAjIFJlc3BvbmQgdG8gY29sbGlzaW9uLlxuXG4iLCJjbGFzcyBDbG90aERlbW8gZXh0ZW5kcyBEZW1vXG5cblx0c2V0dXA6IChmdWxsID0geWVzKSAtPlxuXG5cdFx0c3VwZXJcblxuXHRcdCMgT25seSByZW5kZXIgc3ByaW5ncy5cblx0XHRAcmVuZGVyZXIucmVuZGVyUGFydGljbGVzID0gZmFsc2VcblxuXHRcdEBwaHlzaWNzLmludGVncmF0b3IgPSBuZXcgVmVybGV0KClcblx0XHRAcGh5c2ljcy50aW1lc3RlcCA9IDEuMCAvIDIwMFxuXHRcdEBtb3VzZS5zZXRNYXNzIDEwXG5cblx0XHQjIEFkZCBncmF2aXR5IHRvIHRoZSBzaW11bGF0aW9uLlxuXHRcdEBncmF2aXR5ID0gbmV3IENvbnN0YW50Rm9yY2UgbmV3IFZlY3RvciAwLjAsIDgwLjBcblx0XHRAcGh5c2ljcy5iZWhhdmlvdXJzLnB1c2ggQGdyYXZpdHlcblxuXHRcdHN0aWZmbmVzcyA9IDAuNVxuXHRcdHNpemUgPSBpZiBmdWxsIHRoZW4gOCBlbHNlIDEwXG5cdFx0cm93cyA9IGlmIGZ1bGwgdGhlbiAzMCBlbHNlIDI1XG5cdFx0Y29scyA9IGlmIGZ1bGwgdGhlbiA1NSBlbHNlIDQwXG5cdFx0Y2VsbCA9IFtdXG5cblx0XHRzeCA9IEB3aWR0aCAqIDAuNSAtIGNvbHMgKiBzaXplICogMC41XG5cdFx0c3kgPSBAaGVpZ2h0ICogMC41IC0gcm93cyAqIHNpemUgKiAwLjVcblxuXHRcdGZvciB4IGluIFswLi5jb2xzXVxuXG5cdFx0XHRjZWxsW3hdID0gW11cblxuXHRcdFx0Zm9yIHkgaW4gWzAuLnJvd3NdXG5cblx0XHRcdFx0cCA9IG5ldyBQYXJ0aWNsZSgwLjEpXG5cblx0XHRcdFx0cC5maXhlZCA9ICh5IGlzIDApXG5cblx0XHRcdFx0IyBBbHdheXMgc2V0IGluaXRpYWwgcG9zaXRpb24gdXNpbmcgbW92ZVRvIGZvciBWZXJsZXRcblx0XHRcdFx0cC5tb3ZlVG8gbmV3IFZlY3RvciAoc3ggKyB4ICogc2l6ZSksIChzeSArIHkgKiBzaXplKVxuXG5cdFx0XHRcdGlmIHggPiAwXG5cdFx0XHRcdFx0cyA9IG5ldyBTcHJpbmcgcCwgY2VsbFt4LTFdW3ldLCBzaXplLCBzdGlmZm5lc3Ncblx0XHRcdFx0XHRAcGh5c2ljcy5zcHJpbmdzLnB1c2ggc1xuXG5cdFx0XHRcdGlmIHkgPiAwXG5cdFx0XHRcdFx0cyA9IG5ldyBTcHJpbmcgcCwgY2VsbFt4XVt5IC0gMV0sIHNpemUsIHN0aWZmbmVzc1xuXHRcdFx0XHRcdEBwaHlzaWNzLnNwcmluZ3MucHVzaCBzXG5cblx0XHRcdFx0QHBoeXNpY3MucGFydGljbGVzLnB1c2ggcFxuXHRcdFx0XHRjZWxsW3hdW3ldID0gcFxuXG5cdFx0cCA9IGNlbGxbTWF0aC5mbG9vciBjb2xzIC8gMl1bTWF0aC5mbG9vciByb3dzIC8gMl1cblx0XHRzID0gbmV3IFNwcmluZyBAbW91c2UsIHAsIDEwLCAxLjBcblx0XHRAcGh5c2ljcy5zcHJpbmdzLnB1c2ggc1xuXG5cdFx0Y2VsbFswXVswXS5maXhlZCA9IHRydWVcblx0XHRjZWxsW2NvbHMgLSAxXVswXS5maXhlZCA9IHRydWVcblxuXHRzdGVwOiAtPlxuXG5cdFx0c3VwZXJcblxuXHRcdEBncmF2aXR5LmZvcmNlLnggPSA1MCAqIE1hdGguc2luIG5ldyBEYXRlKCkuZ2V0VGltZSgpICogMC4wMDA1XG4iLCJjbGFzcyBDaGFpbkRlbW8gZXh0ZW5kcyBEZW1vXG5cblx0c2V0dXA6IChmdWxsID0geWVzKSAtPlxuXG5cdFx0c3VwZXJcblxuXHRcdEBzdGlmZm5lc3MgPSAxLjBcblx0XHRAc3BhY2luZyA9IDIuMFxuXG5cdFx0QHBoeXNpY3MuaW50ZWdyYXRvciA9IG5ldyBWZXJsZXQoKVxuXHRcdEBwaHlzaWNzLnZpc2Nvc2l0eSA9IDAuMDAwMVxuXHRcdEBtb3VzZS5zZXRNYXNzIDEwMDBcblxuXHRcdGdhcCA9IDUwLjBcblx0XHRtaW4gPSBuZXcgVmVjdG9yIC1nYXAsIC1nYXBcblx0XHRtYXggPSBuZXcgVmVjdG9yIEB3aWR0aCArIGdhcCwgQGhlaWdodCArIGdhcFxuXG5cdFx0ZWRnZSA9IG5ldyBFZGdlQm91bmNlIG1pbiwgbWF4XG5cblx0XHRjZW50ZXIgPSBuZXcgVmVjdG9yIEB3aWR0aCAqIDAuNSwgQGhlaWdodCAqIDAuNVxuXG5cdFx0I0ByZW5kZXJlci5yZW5kZXJQYXJ0aWNsZXMgPSBub1xuXG5cdFx0d2FuZGVyID0gbmV3IFdhbmRlciAwLjA1LCAxMDAuMCwgODAuMFxuXG5cdFx0bWF4ID0gaWYgZnVsbCB0aGVuIDIwMDAgZWxzZSA2MDBcblxuXHRcdGZvciBpIGluIFswLi5tYXhdXG5cblx0XHRcdHAgPSBuZXcgUGFydGljbGUgNi4wXG5cdFx0XHRwLmNvbG91ciA9ICcjRkZGRkZGJ1xuXHRcdFx0cC5tb3ZlVG8gY2VudGVyXG5cdFx0XHRwLnNldFJhZGl1cyAxLjBcblxuXHRcdFx0cC5iZWhhdmlvdXJzLnB1c2ggd2FuZGVyXG5cdFx0XHRwLmJlaGF2aW91cnMucHVzaCBlZGdlXG5cblx0XHRcdEBwaHlzaWNzLnBhcnRpY2xlcy5wdXNoIHBcblxuXHRcdFx0aWYgb3A/IHRoZW4gcyA9IG5ldyBTcHJpbmcgb3AsIHAsIEBzcGFjaW5nLCBAc3RpZmZuZXNzXG5cdFx0XHRlbHNlIHMgPSBuZXcgU3ByaW5nIEBtb3VzZSwgcCwgQHNwYWNpbmcsIEBzdGlmZm5lc3NcblxuXHRcdFx0QHBoeXNpY3Muc3ByaW5ncy5wdXNoIHNcblxuXHRcdFx0b3AgPSBwXG5cblx0XHRAcGh5c2ljcy5zcHJpbmdzLnB1c2ggbmV3IFNwcmluZyBAbW91c2UsIHAsIEBzcGFjaW5nLCBAc3RpZmZuZXNzIiwiIyMjIEJvdW5kc0RlbW8gIyMjXG5jbGFzcyBCb3VuZHNEZW1vIGV4dGVuZHMgRGVtb1xuXHRcblx0c2V0dXA6IC0+XG5cblx0XHRzdXBlclxuXG5cdFx0bWluID0gbmV3IFZlY3RvciAwLjAsIDAuMFxuXHRcdG1heCA9IG5ldyBWZWN0b3IgQHdpZHRoLCBAaGVpZ2h0XG5cblx0XHRlZGdlID0gbmV3IEVkZ2VXcmFwIG1pbiwgbWF4XG5cblx0XHRmb3IgaSBpbiBbMC4uMjAwXVxuXG5cdFx0XHRwID0gbmV3IFBhcnRpY2xlIChSYW5kb20gMC41LCA0LjApXG5cdFx0XHRwLnNldFJhZGl1cyBwLm1hc3MgKiA1XG5cblx0XHRcdHAubW92ZVRvIG5ldyBWZWN0b3IgKFJhbmRvbSBAd2lkdGgpLCAoUmFuZG9tIEBoZWlnaHQpXG5cblx0XHRcdHAuYmVoYXZpb3Vycy5wdXNoIG5ldyBXYW5kZXIgMC4yLCAxMjAsIFJhbmRvbSAxLjAsIDIuMFxuXHRcdFx0cC5iZWhhdmlvdXJzLnB1c2ggZWRnZVxuXG5cdFx0XHRAcGh5c2ljcy5wYXJ0aWNsZXMucHVzaCBwXG5cblx0XHQiLCIjIyMgQmFsbG9vbkRlbW8gIyMjXG5jbGFzcyBCYWxsb29uRGVtbyBleHRlbmRzIERlbW9cblxuXHRzZXR1cDogKGZ1bGwgPSB5ZXMpIC0+XG5cblx0XHRzdXBlclxuXG5cdFx0QHBoeXNpY3MuaW50ZWdyYXRvciA9IG5ldyBJbXByb3ZlZEV1bGVyKClcblx0XHRhdHRyYWN0aW9uID0gbmV3IEF0dHJhY3Rpb24gQG1vdXNlLnBvc1xuXG5cdFx0bWF4ID0gaWYgZnVsbCB0aGVuIDQwMCBlbHNlIDIwMFxuXG5cdFx0Zm9yIGkgaW4gWzAuLm1heF1cblxuXHRcdFx0cCA9IG5ldyBQYXJ0aWNsZSAoUmFuZG9tIDAuMjUsIDQuMClcblx0XHRcdHAuc2V0UmFkaXVzIHAubWFzcyAqIDhcblxuXHRcdFx0cC5iZWhhdmlvdXJzLnB1c2ggbmV3IFdhbmRlciAwLjJcblx0XHRcdHAuYmVoYXZpb3Vycy5wdXNoIGF0dHJhY3Rpb25cblx0XHRcdFxuXHRcdFx0cC5tb3ZlVG8gbmV3IFZlY3RvciAoUmFuZG9tIEB3aWR0aCksIChSYW5kb20gQGhlaWdodClcblxuXHRcdFx0cyA9IG5ldyBTcHJpbmcgQG1vdXNlLCBwLCAoUmFuZG9tIDMwLCAzMDApLCAxLjBcblxuXHRcdFx0QHBoeXNpY3MucGFydGljbGVzLnB1c2ggcFxuXHRcdFx0QHBoeXNpY3Muc3ByaW5ncy5wdXNoIHNcblxuIiwiY2xhc3MgQXR0cmFjdGlvbkRlbW8gZXh0ZW5kcyBEZW1vXG5cbiAgICBzZXR1cDogKGZ1bGwgPSB5ZXMpIC0+XG5cbiAgICAgICAgc3VwZXIgZnVsbFxuXG4gICAgICAgIG1pbiA9IG5ldyBWZWN0b3IgMC4wLCAwLjBcbiAgICAgICAgbWF4ID0gbmV3IFZlY3RvciBAd2lkdGgsIEBoZWlnaHRcbiAgICAgICAgXG4gICAgICAgIGJvdW5kcyA9IG5ldyBFZGdlQm91bmNlIG1pbiwgbWF4XG5cbiAgICAgICAgQHBoeXNpY3MuaW50ZWdyYXRvciA9IG5ldyBWZXJsZXQoKVxuXG4gICAgICAgIGF0dHJhY3Rpb24gPSBuZXcgQXR0cmFjdGlvbiBAbW91c2UucG9zLCAxMjAwLCAxMjAwXG4gICAgICAgIHJlcHVsc2lvbiA9IG5ldyBBdHRyYWN0aW9uIEBtb3VzZS5wb3MsIDIwMCwgLTIwMDBcbiAgICAgICAgY29sbGlkZSA9IG5ldyBDb2xsaXNpb24oKVxuXG4gICAgICAgIG1heCA9IGlmIGZ1bGwgdGhlbiA0MDAgZWxzZSAyMDBcblxuICAgICAgICBmb3IgaSBpbiBbMC4ubWF4XVxuXG4gICAgICAgICAgICBwID0gbmV3IFBhcnRpY2xlIChSYW5kb20gMC4xLCAzLjApXG4gICAgICAgICAgICBwLnNldFJhZGl1cyBwLm1hc3MgKiA0XG5cbiAgICAgICAgICAgIHAubW92ZVRvIG5ldyBWZWN0b3IgKFJhbmRvbSBAd2lkdGgpLCAoUmFuZG9tIEBoZWlnaHQpXG5cbiAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIGF0dHJhY3Rpb25cbiAgICAgICAgICAgIHAuYmVoYXZpb3Vycy5wdXNoIHJlcHVsc2lvblxuICAgICAgICAgICAgcC5iZWhhdmlvdXJzLnB1c2ggYm91bmRzXG4gICAgICAgICAgICBwLmJlaGF2aW91cnMucHVzaCBjb2xsaWRlXG5cbiAgICAgICAgICAgIGNvbGxpZGUucG9vbC5wdXNoIHBcblxuICAgICAgICAgICAgQHBoeXNpY3MucGFydGljbGVzLnB1c2ggcCIsIiMjIyBJbXBvcnRzICMjI1xue0JlaGF2aW91cn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXInXG5cbiMjIyBXYW5kZXIgQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLldhbmRlciBleHRlbmRzIEJlaGF2aW91clxuXG5cdGNvbnN0cnVjdG9yOiAoQGppdHRlciA9IDAuNSwgQHJhZGl1cyA9IDEwMCwgQHN0cmVuZ3RoID0gMS4wKSAtPlxuXG5cdFx0QHRoZXRhID0gTWF0aC5yYW5kb20oKSAqIE1hdGguUEkgKiAyXG5cblx0XHRzdXBlclxuXG5cdGFwcGx5OiAocCwgZHQsIGluZGV4KSAtPlxuXG5cdFx0I3N1cGVyIHAsIGR0LCBpbmRleFxuXG5cdFx0QHRoZXRhICs9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIEBqaXR0ZXIgKiBNYXRoLlBJICogMlxuXG5cdFx0cC5hY2MueCArPSBNYXRoLmNvcyhAdGhldGEpICogQHJhZGl1cyAqIEBzdHJlbmd0aFxuXHRcdHAuYWNjLnkgKz0gTWF0aC5zaW4oQHRoZXRhKSAqIEByYWRpdXMgKiBAc3RyZW5ndGhcbiIsIiMjIyBJbXBvcnRzICMjI1xue0NvbnN0YW50Rm9yY2V9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvQ29uc3RhbnRGb3JjZSdcblxuIyMjIEdyYXZpdHkgQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLkdyYXZpdHkgZXh0ZW5kcyBDb25zdGFudEZvcmNlXG5cblx0Y29uc3RydWN0b3I6IChAc2NhbGUgPSAxMDAwKSAtPlxuXG5cdFx0c3VwZXIoKVxuXG5cdFx0Zm9yY2UgPSBAZm9yY2Vcblx0XHRzY2FsZSA9IEBzY2FsZVxuXG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIgXCJkZXZpY2Vtb3Rpb25cIiwgLT5cblx0XHRcdGFjY1ggPSBldmVudC5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5Lnhcblx0XHRcdGFjY1kgPSBldmVudC5hY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LnkgKiAtMVxuXG5cdFx0XHRmb3JjZS54ID0gYWNjWCAqIHNjYWxlIC8gMTBcblx0XHRcdGZvcmNlLnkgPSBhY2NZICogc2NhbGUgLyAxMFxuIiwiIyMjIEltcG9ydHMgIyMjXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIEVkZ2UgV3JhcCBCZWhhdmlvdXIgIyMjXG5cbmNsYXNzIGV4cG9ydHMuRWRnZVdyYXAgZXh0ZW5kcyBCZWhhdmlvdXJcblxuXHRjb25zdHJ1Y3RvcjogKEBtaW4gPSBuZXcgVmVjdG9yKCksIEBtYXggPSBuZXcgVmVjdG9yKCkpIC0+XG5cblx0XHRzdXBlclxuXG5cdGFwcGx5OiAocCwgZHQsIGluZGV4KSAtPlxuXG5cdFx0I3N1cGVyIHAsIGR0LCBpbmRleFxuXG5cdFx0aWYgcC5wb3MueCArIHAucmFkaXVzIDwgQG1pbi54XG5cblx0XHRcdHAucG9zLnggPSBAbWF4LnggKyBwLnJhZGl1c1xuXHRcdFx0cC5vbGQucG9zLnggPSBwLnBvcy54XG5cblx0XHRlbHNlIGlmIHAucG9zLnggLSBwLnJhZGl1cyA+IEBtYXgueFxuXG5cdFx0XHRwLnBvcy54ID0gQG1pbi54IC0gcC5yYWRpdXNcblx0XHRcdHAub2xkLnBvcy54ID0gcC5wb3MueFxuXG5cdFx0aWYgcC5wb3MueSArIHAucmFkaXVzIDwgQG1pbi55XG5cblx0XHRcdHAucG9zLnkgPSBAbWF4LnkgKyBwLnJhZGl1c1xuXHRcdFx0cC5vbGQucG9zLnkgPSBwLnBvcy55XG5cblx0XHRlbHNlIGlmIHAucG9zLnkgLSBwLnJhZGl1cyA+IEBtYXgueVxuXG5cdFx0XHRwLnBvcy55ID0gQG1pbi55IC0gcC5yYWRpdXNcblx0XHRcdHAub2xkLnBvcy55ID0gcC5wb3MueVxuIiwiIyMjIEltcG9ydHMgIyMjXG57QmVoYXZpb3VyfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvYmVoYXZpb3VyL0JlaGF2aW91cidcbntWZWN0b3J9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9tYXRoL1ZlY3RvcidcblxuIyMjIEVkZ2UgQm91bmNlIEJlaGF2aW91ciAjIyNcblxuY2xhc3MgZXhwb3J0cy5FZGdlQm91bmNlIGV4dGVuZHMgQmVoYXZpb3VyXG5cblx0Y29uc3RydWN0b3I6IChAbWluID0gbmV3IFZlY3RvcigpLCBAbWF4ID0gbmV3IFZlY3RvcigpKSAtPlxuXG5cdFx0c3VwZXJcblxuXHRhcHBseTogKHAsIGR0LCBpbmRleCkgLT5cblxuXHRcdCNzdXBlciBwLCBkdCwgaW5kZXhcblxuXHRcdGlmIHAucG9zLnggLSBwLnJhZGl1cyA8IEBtaW4ueFxuXG5cdFx0XHRwLnBvcy54ID0gQG1pbi54ICsgcC5yYWRpdXNcblxuXHRcdGVsc2UgaWYgcC5wb3MueCArIHAucmFkaXVzID4gQG1heC54XG5cblx0XHRcdHAucG9zLnggPSBAbWF4LnggLSBwLnJhZGl1c1xuXG5cdFx0aWYgcC5wb3MueSAtIHAucmFkaXVzIDwgQG1pbi55XG5cblx0XHRcdHAucG9zLnkgPSBAbWluLnkgKyBwLnJhZGl1c1xuXG5cdFx0ZWxzZSBpZiBwLnBvcy55ICsgcC5yYWRpdXMgPiBAbWF4LnlcblxuXHRcdFx0cC5wb3MueSA9IEBtYXgueSAtIHAucmFkaXVzXG4iLCIjIyMgSW1wb3J0IEJlaGF2aW91ciAjIyNcbntCZWhhdmlvdXJ9ID0gcmVxdWlyZSAnY29mZmVlUGh5c2ljcy9iZWhhdmlvdXIvQmVoYXZpb3VyJ1xue1ZlY3Rvcn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL21hdGgvVmVjdG9yJ1xuXG4jIyMgQ29uc3RhbnQgRm9yY2UgQmVoYXZpb3VyICMjI1xuXG5jbGFzcyBleHBvcnRzLkNvbnN0YW50Rm9yY2UgZXh0ZW5kcyBCZWhhdmlvdXJcblxuXHRjb25zdHJ1Y3RvcjogKEBmb3JjZSA9IG5ldyBWZWN0b3IoKSkgLT5cblxuXHRcdHN1cGVyXG5cblx0YXBwbHk6IChwLCBkdCxpbmRleCkgLT5cblxuXHRcdCNzdXBlciBwLCBkdCwgaW5kZXhcblxuXHRcdHAuYWNjLmFkZCBAZm9yY2VcbiIsIiMjIyBJbXBvcnQgQmVoYXZpb3VyICMjI1xue0JlaGF2aW91cn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXInXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cbiMjIyBDb2xsaXNpb24gQmVoYXZpb3VyICMjI1xuXG4jIFRPRE86IENvbGxpc2lvbiByZXNwb25zZSBmb3Igbm9uIFZlcmxldCBpbnRlZ3JhdG9ycy5cblxuY2xhc3MgZXhwb3J0cy5Db2xsaXNpb24gZXh0ZW5kcyBCZWhhdmlvdXJcblxuICAgIGNvbnN0cnVjdG9yOiAoQHVzZU1hc3MgPSB5ZXMsIEBjYWxsYmFjayA9IG51bGwpIC0+XG5cbiAgICAgICAgIyBQb29sIG9mIGNvbGxpZGFibGUgcGFydGljbGVzLlxuICAgICAgICBAcG9vbCA9IFtdXG5cbiAgICAgICAgIyBEZWx0YSBiZXR3ZWVuIHBhcnRpY2xlIHBvc2l0aW9ucy5cbiAgICAgICAgQF9kZWx0YSA9IG5ldyBWZWN0b3IoKVxuXG4gICAgICAgIHN1cGVyXG5cbiAgICBhcHBseTogKHAsIGR0LCBpbmRleCkgLT5cblxuICAgICAgICAjc3VwZXIgcCwgZHQsIGluZGV4XG5cbiAgICAgICAgIyBDaGVjayBwb29sIGZvciBjb2xsaXNpb25zLlxuICAgICAgICBmb3IgbyBpbiBAcG9vbFtpbmRleC4uXSB3aGVuIG8gaXNudCBwXG5cbiAgICAgICAgICAgICMgRGVsdGEgYmV0d2VlbiBwYXJ0aWNsZXMgcG9zaXRpb25zLlxuICAgICAgICAgICAgKEBfZGVsdGEuY29weSBvLnBvcykuc3ViIHAucG9zXG5cbiAgICAgICAgICAgICMgU3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIHBhcnRpY2xlcy5cbiAgICAgICAgICAgIGRpc3RTcSA9IEBfZGVsdGEubWFnU3EoKVxuXG4gICAgICAgICAgICAjIFN1bSBvZiBib3RoIHJhZGlpLlxuICAgICAgICAgICAgcmFkaWkgPSBwLnJhZGl1cyArIG8ucmFkaXVzXG5cbiAgICAgICAgICAgICMgQ2hlY2sgaWYgcGFydGljbGVzIGNvbGxpZGUuXG4gICAgICAgICAgICBpZiBkaXN0U3EgPD0gcmFkaWkgKiByYWRpaVxuXG4gICAgICAgICAgICAgICAgIyBDb21wdXRlIHJlYWwgZGlzdGFuY2UuXG4gICAgICAgICAgICAgICAgZGlzdCA9IE1hdGguc3FydCBkaXN0U3FcblxuICAgICAgICAgICAgICAgICMgRGV0ZXJtaW5lIG92ZXJsYXAuXG4gICAgICAgICAgICAgICAgb3ZlcmxhcCA9IHJhZGlpIC0gZGlzdFxuICAgICAgICAgICAgICAgIG92ZXJsYXAgKz0gMC41XG5cbiAgICAgICAgICAgICAgICAjIFRvdGFsIG1hc3MuXG4gICAgICAgICAgICAgICAgbXQgPSBwLm1hc3MgKyBvLm1hc3NcblxuICAgICAgICAgICAgICAgICMgRGlzdHJpYnV0ZSBjb2xsaXNpb24gcmVzcG9uc2VzLlxuICAgICAgICAgICAgICAgIHIxID0gaWYgQHVzZU1hc3MgdGhlbiBvLm1hc3MgLyBtdCBlbHNlIDAuNVxuICAgICAgICAgICAgICAgIHIyID0gaWYgQHVzZU1hc3MgdGhlbiBwLm1hc3MgLyBtdCBlbHNlIDAuNVxuXG4gICAgICAgICAgICAgICAgIyBNb3ZlIHBhcnRpY2xlcyBzbyB0aGV5IG5vIGxvbmdlciBvdmVybGFwLlxuICAgICAgICAgICAgICAgIHAucG9zLmFkZCAoQF9kZWx0YS5jbG9uZSgpLm5vcm0oKS5zY2FsZSBvdmVybGFwICogLXIxKVxuICAgICAgICAgICAgICAgIG8ucG9zLmFkZCAoQF9kZWx0YS5ub3JtKCkuc2NhbGUgb3ZlcmxhcCAqIHIyKVxuXG4gICAgICAgICAgICAgICAgIyBGaXJlIGNhbGxiYWNrIGlmIGRlZmluZWQuXG4gICAgICAgICAgICAgICAgQGNhbGxiYWNrPyhwLCBvLCBvdmVybGFwKVxuIiwiIyMjIEJlaGF2aW91ciAjIyNcblxuY2xhc3MgZXhwb3J0cy5CZWhhdmlvdXJcblxuXHQjIEVhY2ggYmVoYXZpb3VyIGhhcyBhIHVuaXF1ZSBpZFxuXHRAR1VJRCA9IDBcblxuXHRjb25zdHJ1Y3RvcjogLT5cblxuXHRcdEBHVUlEID0gQmVoYXZpb3VyLkdVSUQrK1xuXHRcdEBpbnRlcnZhbCA9IDFcblxuXHRcdCMjIGNvbnNvbGUubG9nIEAsIEBHVUlEXG5cblx0YXBwbHk6IChwLCBkdCwgaW5kZXgpIC0+XG5cblx0XHQjIFN0b3JlIHNvbWUgZGF0YSBpbiBlYWNoIHBhcnRpY2xlLlxuXHRcdChwWydfX2JlaGF2aW91cicgKyBAR1VJRF0gPz0ge2NvdW50ZXI6IDB9KS5jb3VudGVyKytcbiIsIiMjIyBJbXBvcnRzICMjI1xue0JlaGF2aW91cn0gPSByZXF1aXJlICdjb2ZmZWVQaHlzaWNzL2JlaGF2aW91ci9CZWhhdmlvdXInXG57VmVjdG9yfSA9IHJlcXVpcmUgJ2NvZmZlZVBoeXNpY3MvbWF0aC9WZWN0b3InXG5cbiMjIyBBdHRyYWN0aW9uIEJlaGF2aW91ciAjIyNcblxuY2xhc3MgZXhwb3J0cy5BdHRyYWN0aW9uIGV4dGVuZHMgQmVoYXZpb3VyXG5cbiAgICBjb25zdHJ1Y3RvcjogKEB0YXJnZXQgPSBuZXcgVmVjdG9yKCksIEByYWRpdXMgPSAxMDAwLCBAc3RyZW5ndGggPSAxMDAuMCkgLT5cblxuICAgICAgICBAX2RlbHRhID0gbmV3IFZlY3RvcigpXG4gICAgICAgIEBzZXRSYWRpdXMgQHJhZGl1c1xuXG4gICAgICAgIHN1cGVyXG5cbiAgICAjIyMgU2V0cyB0aGUgZWZmZWN0aXZlIHJhZGl1cyBvZiB0aGUgYmFoYXZpb3VzLiAjIyNcbiAgICBzZXRSYWRpdXM6IChyYWRpdXMpIC0+XG5cbiAgICAgICAgQHJhZGl1cyA9IHJhZGl1c1xuICAgICAgICBAcmFkaXVzU3EgPSByYWRpdXMgKiByYWRpdXNcblxuICAgIGFwcGx5OiAocCwgZHQsIGluZGV4KSAtPlxuXG4gICAgICAgICNzdXBlciBwLCBkdCwgaW5kZXhcblxuICAgICAgICAjIFZlY3RvciBwb2ludGluZyBmcm9tIHBhcnRpY2xlIHRvIHRhcmdldC5cbiAgICAgICAgKEBfZGVsdGEuY29weSBAdGFyZ2V0KS5zdWIgcC5wb3NcblxuICAgICAgICAjIFNxdWFyZWQgZGlzdGFuY2UgdG8gdGFyZ2V0LlxuICAgICAgICBkaXN0U3EgPSBAX2RlbHRhLm1hZ1NxKClcblxuICAgICAgICAjIExpbWl0IGZvcmNlIHRvIGJlaGF2aW91ciByYWRpdXMuXG4gICAgICAgIGlmIGRpc3RTcSA8IEByYWRpdXNTcSBhbmQgZGlzdFNxID4gMC4wMDAwMDFcblxuICAgICAgICAgICAgIyBDYWxjdWxhdGUgZm9yY2UgdmVjdG9yLlxuICAgICAgICAgICAgQF9kZWx0YS5ub3JtKCkuc2NhbGUgKDEuMCAtIGRpc3RTcSAvIEByYWRpdXNTcSlcblxuICAgICAgICAgICAgI0FwcGx5IGZvcmNlLlxuICAgICAgICAgICAgcC5hY2MuYWRkIEBfZGVsdGEuc2NhbGUgQHN0cmVuZ3RoXG4iLCIjIyMgQWxsb3dzIHNhZmUsIGR5YW1pYyBjcmVhdGlvbiBvZiBuYW1lc3BhY2VzLiAjIyNcblxubmFtZXNwYWNlID0gKGlkKSAtPlxuXHRyb290ID0gc2VsZlxuXHRyb290ID0gcm9vdFtwYXRoXSA/PSB7fSBmb3IgcGF0aCBpbiBpZC5zcGxpdCAnLidcblxuIyMjIFJlcXVlc3RBbmltYXRpb25GcmFtZSBzaGltLiAjIyNcbmRvIC0+XG5cbiAgICB0aW1lID0gMFxuICAgIHZlbmRvcnMgPSBbJ21zJywgJ21veicsICd3ZWJraXQnLCAnbyddXG5cbiAgICBmb3IgdmVuZG9yIGluIHZlbmRvcnMgd2hlbiBub3Qgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyB2ZW5kb3IgKyAnUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93WyB2ZW5kb3IgKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuXG4gICAgaWYgbm90IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWVcblxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gKGNhbGxiYWNrLCBlbGVtZW50KSAtPlxuICAgICAgICAgICAgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgICAgICAgICAgIGRlbHRhID0gTWF0aC5tYXggMCwgMTYgLSAobm93IC0gb2xkKVxuICAgICAgICAgICAgc2V0VGltZW91dCAoLT4gY2FsbGJhY2sodGltZSArIGRlbHRhKSksIGRlbHRhXG4gICAgICAgICAgICBvbGQgPSBub3cgKyBkZWx0YVxuXG4gICAgaWYgbm90IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuICAgICAgICBcbiAgICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKGlkKSAtPlxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0IGlkXG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQWdDQUE7O0FEQUE7QUFBQSxJQUFBOztBQUVBLFNBQUEsR0FBWSxTQUFDLEVBQUQ7QUFDWCxNQUFBO0VBQUEsSUFBQSxHQUFPO0FBQ1A7QUFBQTtPQUFBLHFDQUFBOztpQkFBQSxJQUFBLHdCQUFPLElBQUssQ0FBQSxJQUFBLElBQUwsSUFBSyxDQUFBLElBQUEsSUFBUztBQUFyQjs7QUFGVzs7O0FBSVo7O0FBQ0csQ0FBQSxTQUFBO0FBRUMsTUFBQTtFQUFBLElBQUEsR0FBTztFQUNQLE9BQUEsR0FBVSxDQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsUUFBZCxFQUF3QixHQUF4QjtBQUVWLE9BQUEseUNBQUE7O1VBQTJCLENBQUksTUFBTSxDQUFDOzs7SUFDbEMsTUFBTSxDQUFDLHFCQUFQLEdBQStCLE1BQVEsQ0FBQSxNQUFBLEdBQVMsdUJBQVQ7SUFDdkMsTUFBTSxDQUFDLG9CQUFQLEdBQThCLE1BQVEsQ0FBQSxNQUFBLEdBQVMsc0JBQVQ7QUFGMUM7RUFJQSxJQUFHLENBQUksTUFBTSxDQUFDLHFCQUFkO0lBRUksTUFBTSxDQUFDLHFCQUFQLEdBQStCLFNBQUMsUUFBRCxFQUFXLE9BQVg7QUFDM0IsVUFBQTtNQUFBLEdBQUEsR0FBVSxJQUFBLElBQUEsQ0FBQSxDQUFNLENBQUMsT0FBUCxDQUFBO01BQ1YsS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLEVBQUEs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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIn0=
