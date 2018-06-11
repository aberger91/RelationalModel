
var RelationalModel = (() => function() {

    function isBoyceCoddForm(arrayOfFuncDeps, attrs) {
        let superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        for (let f of arrayOfFuncDeps) {
            if (!containsAttr(superkeys, f.lhs))
                return false; 
        }
        return true;
    }

    function isThirdNormalForm(arrayOfFuncDeps, attrs) {
        let superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        let primarykey = getPrimaryKey(arrayOfFuncDeps, attrs);
        for (let f of arrayOfFuncDeps) {
            if (!containsAttr(superkeys, f.lhs) && 
                (!containsAttr(primarykey.split(), f.rhs)))
                return false
        }
        return true;
    }

    function getPrimaryKey(arrayOfFuncDeps, attrs) {
        let superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        superkeys = superkeys.sort(function (a, b) {return a.length - b.length});
        return superkeys[0];
    }

    function getCandidateKeys(arrayOfFuncDeps, attrs) {
        let superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        let minimumBasis = superkeys.sort(function (a, b) {return a.length-b.length})[0].getLength();
        let candidates = [ ];//superkeys.map(function(a) {return a == minimumBasis});
        for (let key of superkeys) {
            if (key.getLength() == minimumBasis)
                candidates.push(key);
        }
        return candidates;
    }

    function getAllSuperKeys(arrayOfFuncDeps, attrs) {
        let combs = combinations(attrs.split());
        let superkeys = [];
        for (let c of combs) {
            if (is_superkey(c, arrayOfFuncDeps, attrs))
            {
                superkeys.push(c);
            }
        }
        return superkeys;
    }

    function is_superkey(attr, arrayOfFuncDeps, attrs) {
        let closure = find_closure(attr, arrayOfFuncDeps);
        return (closure.equals(attrs))
    }

    function find_closure(attr, arrayOfFuncDeps) {
        for (let a of attr.iter())
        {
            for (let funcDep of arrayOfFuncDeps) {
                if (funcDep.rhs.isSubsetOf(attr)) 
                    continue
                if (funcDep.lhs.isSubsetOf(attr) || a.isSubsetOf(funcDep.lhs))
                {
                    attr = attr.addAttri(funcDep.rhs);
                    attr = find_closure(attr, arrayOfFuncDeps);
                }
            }
        }
        return attr;
    }

    function combinations(listOfAttrs) {
        let set = []
        let length = listOfAttrs.length;
        let n_combinations = (1<<length);
        let combination;
        for (let x=1; x<n_combinations; x++) {
            let combs = [];
            for (let y=0; y<length; y++) {
                if ((x & (1 << y))) {
                    combs.push(listOfAttrs[y]);
                }
            }
            combs = convertArrayOfAttributesToAttributeSet(combs);
            set.push(combs);
        }
        return set;
    }

    function convertArrayOfAttributesToAttributeSet(listOfAttrs) {
        let attr = new Attribute(listOfAttrs[0].val);
        for (let x=1; x<listOfAttrs.length; x++) {
            attr = attr.addAttri(listOfAttrs[x]);
        }
        return attr;
    }

    function containsAttr(listOfAttrs, attr) {
        for (let a of listOfAttrs) {
            if (a.equals(attr))
                return true;
        }
        return false
    }

    class Attribute {
        constructor(val) {
            this.val = val;
            this._length = 1;
        }
        addAttri(attr) {
            if (attr.getLength() > 1) // AttributeSet
            {
                if (attr.contains(this))
                {
                    let result = new AttributeSet(...attr._attrs);
                    return result;
                }
                return new AttributeSet(new Attribute(this.val), ...attr._attrs);
            }
            else // Attribute
            {
                if (this.val == '')
                    return new Attribute(attr.val);
                if (this.val != attr.val)
                    return new AttributeSet(new Attribute(this.val), attr);
                return new Attribute(this.val);
            }
        }
        print() {
            console.log(this.toString());
            return this.toString();
        }
        isSubsetOf(attr) {
            return attr.contains(this);
        }
        contains(attr) {
            return this.val == attr.val;
        }
        toString() {
            return this.val.toString().toUpperCase();
        }
        iter() {
            return [new Attribute(this.val)]; 
        }
        equals(attr) {
            if (attr.getLength() != this._length) return false;
            return attr.val == this.val;
        }
        split() {
            return [new Attribute(this.val)];
        }
        clear() {
            this.val = '';
            return new Attribute('');
        }
        getLength() {
            return this._length;
        }
    };

    class AttributeSet {
        constructor(args) {
            this._attrs = [...arguments];
            this._length = this._attrs.length;
        }
        getLength() {
            return this._attrs.length;
        }
        addAttri(attr) {
            let newAttrs = this.iter();
            if (attr.getLength() > 1) // AttributeSet
            {
                for (let a of attr.iter())
                {
                    if (!this.contains(a))
                        newAttrs.push(a);
                }
            }
            else // Attribute
            {
                if (!this.contains(attr))
                    newAttrs.push(attr);
            }
            let result = new AttributeSet(...newAttrs);
            return result;
        }
        print() {
            let msg = '';
            for (let attr of this._attrs) {
                msg += attr.toString();
            }
            console.log(msg);
            return msg;
        }
        iter() {
            return this._attrs;
        }
        _getVals() {
            return this._attrs.map(function(x) {return x.val});
        }
        equals(attr) {
            let length = this.getLength();
            if (attr.getLength() != length) return false;
            let arr = attr._getVals().sort();
            let this_arr = this._getVals().sort();
            for (let x=0; x<length; x++)
            {
                if (arr[x] != this_arr[x]) return false;
            }
            return true;
        }
        contains(attr) {
            if (this._attrs.map(function(x) {return x.val}).indexOf(attr.val) == -1)
                return false;
            return true;
        }
        isSubsetOf(attriSet) {
            for (let attr of this._attrs)
            {
                if (!attriSet.contains(attr))
                    return false;
            }
            return true;
        }
        toString() {
            let msg = '';
            for (let c of this._attrs)
                msg += c.toString().toUpperCase();
            return msg;
        }
        split() {
            let arr = new Array();
            for (let a of this._attrs)
                arr.push(a);
            return arr;
        }
        clear() {
            for (let x of this._attrs)
                x = new Attribute('');
            return new AttributeSet();
        }
        push(attr) {
            this.addAttri(attr);
        }
    };

    class FuncDep {
        constructor(lhs, rhs) {
            this.lhs = lhs
            this.rhs = rhs
        };
        print() {
            let msg = this.lhs.toString() + ' --> ' + this.rhs.toString();
            console.log(msg);
            return msg;
        }
    };

    return {
        Attribute: Attribute,
        AttributeSet: AttributeSet,
        FuncDep: FuncDep,
        find_closure: find_closure,
        is_superkey: is_superkey,
        getAllSuperKeys: getAllSuperKeys,
        getCandidateKeys: getCandidateKeys,
        getPrimaryKey: getPrimaryKey,
        isThirdNormalForm: isThirdNormalForm,
        isBoyceCoddForm: isBoyceCoddForm
    };

})()();

let rm = RelationalModel;

let a = new rm.Attribute('A');
let b = new rm.Attribute('B');
let c = new rm.Attribute('C');
let d = new rm.Attribute('D');
let e = new rm.Attribute('E');
let f = new rm.Attribute('F');
let ab = new rm.AttributeSet(a, b);
let ef = new rm.AttributeSet(e, f);

let f1 = new rm.FuncDep(ab, c);
let f2 = new rm.FuncDep(c, d);
let f3 = new rm.FuncDep(d, a);

let closure = rm.find_closure(ab, [f1, f2, f3]);
console.log(closure);

let boycecodd = rm.isBoyceCoddForm([f1, f2, f3], new rm.AttributeSet(a, b, c, d));
console.log(boycecodd);

