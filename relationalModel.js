
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
        console.log('arrayOfFuncDeps', arrayOfFuncDeps);
        for (let a of attr.iter())
        {
            for (let funcDep of arrayOfFuncDeps) {
                console.log('funcDep', funcDep);
                if (funcDep.rhs.isSubsetOf(attr)) 
                    continue
                if (funcDep.lhs.isSubsetOf(attr) || a.isSubsetOf(funcDep.lhs))
                {
                    //attr = attr.addAttri(
                    console.log('rhs', funcDep.rhs);
                    //attr = find_closure(
                    //  attr.addAttri(funcDep.rhs), 
                    //  arrayOfFuncDeps
                    //)
                }
            }
        }
        console.log('return from closure', attr);
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
            if (attr.length > 1)
            {
                var newAttrs = attr.iter();
                if (!attr.contains(this))
                {
                    console.log('pushing', attr);
                    newAttrs.push(attr);
                }
                let result = new AttributeSet(...newAttrs);
                console.log('returning new attribute set from attribute', result);
                return result;
            }
            else
                if (this.val == '')
                    return new Attribute(attr.val);
                if (this.val != attr.val)
                    return new AttributeSet(this, attr);
                return new Attribute(this.val);
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
        split() {
            return [this];
        }
        slice(n) {
            return new Attribute(this.val);
        }
    };

    class AttributeSet {
        constructor(...args) {
            this._attrs = args;
            this.length = this._attrs.length;
        }
        addAttri(attr) {
            var newAttrs = this.iter();
            if (attr.length > 1)
            {
                for (let a of attr.iter())
                {
                    if (!this.contains(a))
                        newAttrs.push(a);
                }
            }
            else
            {
                if (!this.contains(attr))
                    newAttrs.push(attr);
            }
            let result = new AttributeSet(...newAttrs);
            console.log('returning new attribute set from attribute set', result);
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
        slice(n) {
            return new AttributeSet(...this._attrs.slice(n));
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
            console.log('init lhs', lhs, 'init rhs', rhs)
            this.lhs = lhs.slice(0);
            this.rhs = rhs.slice(0);
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
        getPrimaryKey: getPrimaryKey,
        isThirdNormalForm: isThirdNormalForm,
        isBoyceCoddForm: isBoyceCoddForm
    };

})()();

var Tests = (() => function () {
    function run() {
        var rm = RelationalModel;
        var a = new rm.Attribute('A');
        var b = new rm.Attribute('B');
        console.log('b', b)
        var c = new rm.Attribute('C');
        console.log('c', c)
        var bc = new rm.AttributeSet(b, c);
        console.log('bc', bc)
        var d = new rm.Attribute('D');
        var e = new rm.Attribute('E');
        var f = new rm.Attribute('F');
        var g = new rm.Attribute('G');
        var h = new rm.Attribute('H');
        var i = new rm.Attribute('I');
        var ab = new rm.AttributeSet(a, b);
        var abc = new rm.AttributeSet(a, b, c);
        var dc = new rm.AttributeSet(d, c);
        var be = new rm.AttributeSet(b, e);
        var ci = new rm.AttributeSet(c, i);
        var ef = e.addAttri(f);
        var efg = ef.addAttri(g);
        var hi = new rm.AttributeSet(h, i);
        var efghi = ef.addAttri(hi);
        var f_1 = new rm.FuncDep(a, bc);
        var f_2 = new rm.FuncDep(b, c);
        var f_3 = new rm.FuncDep(d, g);
        var f_4 = new rm.FuncDep(g, ci);
        f_1.print();
        f_2.print();
        f_3.print();
        f_4.print();
        //var attrs = rm.find_closure(a, [f_1, f_2, f_3, f_4])//, f_bc, f_cd]);
        //console.log('closure of A in above: ');
        //attrs.print();
        console.log('bc', bc)
        var attrs = rm.find_closure(a, [f_1, f_2])//, f_bc, f_cd]);
        console.log('closure of A in A-->B,C; B-->C; : ');
        attrs.print();
        //attrs = rm.find_closure(a, [new rm.FuncDep(ab, c), new rm.FuncDep(c, d)])//, f_bc, f_cd]);
        ////console.log('closure of A in A,B-->C; C-->D; : ');
        //attrs.print();
        //attrs = rm.find_closure(a, [new rm.FuncDep(a, b), new rm.FuncDep(f, g)])//, f_bc, f_cd]);
        ////console.log('closure of A in A-->B; F-->G; : ');
        //attrs.print();
        //attrs = rm.find_closure(a, [new rm.FuncDep(ab, dc), new rm.FuncDep(d, e)])//, f_bc, f_cd]);
        //console.log('closure of A in A,B-->D,C; D-->E; : ');
        //attrs.print();
        ////console.log(rm.is_superkey(a, [f_1, f_2, f_3, f_4], new rm.AttributeSet(a, b, c, d, e, g, i)))
    }
    return {
        run: run
    }
})();

let tests = Tests();
tests.run();

//let rm = RelationalModel;
//var a = new rm.Attribute('A');
//var b = new rm.Attribute('B');
//var c = new rm.Attribute('C');
//var d = new rm.Attribute('D');
//var e = new rm.Attribute('E');
//var f = new rm.Attribute('F');
//var g = new rm.Attribute('G');
//var h = new rm.Attribute('H');
//var i = new rm.Attribute('I');
//var ab = new rm.AttributeSet(a, b);
//var bc = new rm.AttributeSet(b, c);
//console.log('bc', bc);
//var ac = a.addAttri(c)
//var ef = e.addAttri(f);
//var efg = ef.addAttri(g);
//var hi = new rm.AttributeSet(h, i);
//var efghi = ef.addAttri(hi);
//
//f_1 = new rm.FuncDep(ab, b)
//f_2 = new rm.FuncDep(ab, c)
//f_3 = new rm.FuncDep(ac, d) //console.log(rm.isThirdNormalForm([f_1, f_2, f_3], new rm.AttributeSet(a, b, c, d)))

let rm = RelationalModel;

