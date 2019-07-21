import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'

baseComponent({
    relations: {
        '../cell/index': {
            type: 'child',
            observer() {
                this.debounce(this.updateIsLastElement)
            },
        },
    },
    properties: {
        prefixCls: {
            type: String,
            value: 'wux-cell-group',
        },
        title: {
            type: String,
            value: '',
        },
        label: {
            type: String,
            value: '',
        },
    },
    computed: {
        classes: ['prefixCls', function(prefixCls) {
            const wrap = classNames(prefixCls)
            const hd = `${prefixCls}__hd`
            const bd = `${prefixCls}__bd`
            const ft = `${prefixCls}__ft`

            return {
                wrap,
                hd,
                bd,
                ft,
            }
        }],
    },
    methods: {
        updateIsLastElement() {
            const elements = this.getRelationNodes('../cell/index')
            if (elements.length > 0) {
                const lastIndex = elements.length - 1
                elements.forEach((element, index) => {
                    element.updateIsLastElement(index === lastIndex)
                })
            }
        },
    },
})
