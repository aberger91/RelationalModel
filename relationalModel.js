
var RelationalModel = (() => function() {

    function getPrimaryKey(arrayOfFuncDeps, attrs) {
        var superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        console.log(superkeys)
        superkeys = superkeys.sort(function (a, b) {return a.length - b.length});
        console.log(superkeys)
        return superkeys[0];
    }

    function getAllSuperKeys(arrayOfFuncDeps, attrs) {
        var combs = combinations(attrs.split());
        var superkeys = [];
        for (let c of combs) {
            var closure = find_closure(c, arrayOfFuncDeps);
            if (closure.equals(attrs)) {
                superkeys.push(c);
            }
        }
        return superkeys;
    }

    function combinations(listOfAttrs) {
        var set = []
        var length = listOfAttrs.length;
        var n_combinations = (1<<length);
        var combination;
        for (var x=1; x<n_combinations; x++) {
            var combs = [];
            for (var y=0; y<length; y++) {
                if ((x & (1 << y))) {
                    combs.push(listOfAttrs[y]);
                }
            }
            combs = convertArrayOfAttributesToAttributeSet(combs);
            set.push(combs);
        }
        return set;
    }

    function is_superkey(attr, arrayOfFuncDeps, attrs) {
        var closure = find_closure(attr, arrayOfFuncDeps);
        return (closure.equals(attrs))
    }

    function find_closure(attr, arrayOfFuncDeps) {
        for (let a of attr.iter())
        {
            for (let funcDep of arrayOfFuncDeps) {
                if (funcDep.rhs.isSubsetOf(attr)) 
                    continue
                if (funcDep.lhs.isSubsetOf(attr) || a.isSubsetOf(funcDep.lhs))
                    attr = attr.addAttri(
                                find_closure(
                                  attr.addAttri(funcDep.rhs), 
                                  arrayOfFuncDeps
                                )
                    )
            }
        }
        return attr;
    }

    function convertArrayOfAttributesToAttributeSet(listOfAttrs) {
        var attr = new Attribute(listOfAttrs[0].val);
        for (var x=1; x<listOfAttrs.length; x++) {
            attr = attr.addAttri(listOfAttrs[x]);
        }
        return attr;
    }

    class Attribute {
        constructor(val) {
            this.val = val;
            this.length = 1;
        }
        addAttri(attr) {
            if (attr.length > 1)
            {
                var newAttrs = attr.attrs.slice();
                if (!attr.contains(this))
                    newAttrs.push(this.val);
                return new AttributeSet(...newAttrs);
            }
            else
                if (this.val == '')
                    return new Attribute(attr.val);
                if (this.val != attr.val)
                    return new AttributeSet(this, attr);
                return this;
        }
        print() {
            console.log('A('+this.val+')');
        }
        isSubsetOf(attr) {
            return attr.contains(this);
        }
        contains(attr) {
            return this.val == attr.val;
        }
        toString() {
            return this.val.toString();
        }
        iter() {
            return [this]; 
        }
        equals(attr) {
            if (attr.length != this.length) return false;
            return attr.val == this.val;
        }
    };

    class AttributeSet {
        constructor(args) {
            this.attrs = new Array(...arguments);
            this.length = this.attrs.length;
        }
        addAttri(attr) {
            var newAttrs = this.attrs.slice();
            if (attr.length > 1)
            {
                for (let a of attr.attrs)
                    if (!this.contains(a))
                        newAttrs.push(a);
            }
            else
                if (!this.contains(attr))
                    newAttrs.push(attr);
            return new AttributeSet(...newAttrs);
        }
        print() {
            var msg = 'ASet(';
            for (let attr of this.attrs) {
                msg += attr.val
            }
            msg += ')';
            console.log(msg);
        }
        iter() {
            return this.attrs;
        }
        _getVals() {
            return this.attrs.map(function(x) {return x.val});
        }
        equals(attr) {
            if (attr.length != this.length) return false;
            var arr = attr._getVals().sort();
            var this_arr = this._getVals().sort();
            for (var x=0; x<this.length; x++)
            {
                if (arr[x] != this_arr[x]) return false;
            }
            return true;
        }
        contains(attr) {
            if (this.attrs.map(function(x) {return x.val}).indexOf(attr.val) == -1)
                return false;
            return true;
        }
        isSubsetOf(attriSet) {
            for (let attr of this.attrs)
                if (!attriSet.contains(attr))
                    return false;
            return true;
        }
        toString() {
            var msg = '';
            for (let c of this.attrs)
                msg += c;
            return msg;
        }
        slice(n) {
            return new AttributeSet(...this.attrs.slice(n));
        }
        split() {
            var arr = new Array();
            for (let a of this.attrs)
                arr.push(a);
            return arr;
        }
    };

    class FuncDep {
        constructor(lhs, rhs) {
            this.lhs = lhs;
            this.rhs = rhs;
        };
        print() {
            var msg = this.lhs.toString() + ' -> ' + this.rhs.toString();
            console.log(msg);
        }
    };

    return {
        Attribute: Attribute,
        AttributeSet: AttributeSet,
        FuncDep: FuncDep,
        find_closure: find_closure,
        is_superkey: is_superkey,
        combinations: combinations,
        convertArrayOfAttributesToAttributeSet: convertArrayOfAttributesToAttributeSet,
        getAllSuperKeys: getAllSuperKeys,
        getPrimaryKey: getPrimaryKey
    };

})()();

