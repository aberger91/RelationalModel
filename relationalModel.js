
var RelationalModel = (() => function() {

    function isBoyceCoddForm(arrayOfFuncDeps, attrs) {
        var superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        var primarykey = getPrimaryKey(arrayOfFuncDeps, attrs);
        for (let f of arrayOfFuncDeps) {
            if (!containsAttri(superkeys, f.lhs))
                return false; 
        }
        return true;
    }

    function isThirdNormalForm(arrayOfFuncDeps, attrs) {
        var superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        var primarykey = getPrimaryKey(arrayOfFuncDeps, attrs);
        for (let f of arrayOfFuncDeps) {
            if (!containsAttr(superkeys, f.lhs) && 
                (!containsAttr(primarykey.split(), f.rhs)))
                return false
        }
        return true;
    }

    function getPrimaryKey(arrayOfFuncDeps, attrs) {
        var superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        superkeys = superkeys.sort(function (a, b) {return a.length - b.length});
        return superkeys[0];
    }

    function getCandidateKeys(arrayOfFuncDeps, attrs) {
        let superkeys = getAllSuperKeys(arrayOfFuncDeps, attrs);
        let minimumBasis = superkeys.sort(function (a, b) {return a.length-b.length})[0].length;
        let candidates = superkeys.map(function(a) {return a == minimumBasis});
        return candidates;
    }

    function getAllSuperKeys(arrayOfFuncDeps, attrs) {
        var combs = combinations(attrs.split());
        var superkeys = [];
        for (let c of combs) {
            if (is_superkey(c, arrayOfFuncDeps, attrs))
                superkeys.push(c);
        }
        return superkeys;
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
                {
                    attr = attr.addAttri(funcDep.rhs);
                    attr = find_closure(attr, arrayOfFuncDeps);
                }
            }
        }
        return attr;
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

    function convertArrayOfAttributesToAttributeSet(listOfAttrs) {
        var attr = new Attribute(listOfAttrs[0].val);
        for (var x=1; x<listOfAttrs.length; x++) {
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
            this.length = 1;
        }
        addAttri(attr) {
            if (attr.length > 1) // AttributeSet
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
            return [new Attribute(this.val)]; 
        }
        equals(attr) {
            if (attr.length != this.length) return false;
            return attr.val == this.val;
        }
        split() {
            return [new Attribute(this.val)];
        }
    };

    class AttributeSet {
        constructor(args) {
            this._attrs = [...arguments];
            this.length = this._attrs.length;
        }
        addAttri(attr) {
            var newAttrs = this.iter();
            if (attr.length > 1) // AttributeSet
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
            var msg = 'ASet(';
            for (let attr of this._attrs) {
                msg += attr.val
            }
            msg += ')';
            console.log(msg);
        }
        iter() {
            return this._attrs;
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
            var msg = '';
            for (let c of this._attrs)
                msg += c;
            return msg;
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
            this.lhs = lhs
            this.rhs = rhs
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
        getAllSuperKeys: getAllSuperKeys,
        getCandidateKeys: getCandidateKeys
        getPrimaryKey: getPrimaryKey,
        isThirdNormalForm: isThirdNormalForm,
        isBoyceCoddForm: isBoyceCoddForm
    };

})()();

let rm = RelationalModel;

