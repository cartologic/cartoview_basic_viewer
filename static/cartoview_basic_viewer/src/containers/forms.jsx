import t from 'tcomb-form'
export const generalFormSchema = () => {
    const selectKeywordItem = t.struct({
        value: t.String,
        label: t.String
    })
    const formSchema = t.struct({
        title: t.String,
        abstract: t.maybe(t.String),
        keywords: t.list(selectKeywordItem)
    })
    return formSchema
}
export const accessFormSchema = () => {
    const selectUserItem = t.struct({
        value: t.String,
        label: t.String
    })
    const formSchema = t.struct({
        whoCanView: t.maybe(t.list(selectUserItem)),
        whoCanChangeMetadata: t.maybe(t.list(selectUserItem)),
        whoCanDelete: t.maybe(t.list(selectUserItem)),
        whoCanChangeConfiguration: t.maybe(t.list(selectUserItem))
    })
    return formSchema
}
export const bookmarksFormSchema = () => {
    const selectUserItem = t.struct({
        name: t.String,
        extent: t.String
    })
    const formSchema = t.struct({
        bookmarks: t.maybe(t.list(selectUserItem)),
    })
    return formSchema
}
export const toolFormSchema = () => {
    const formSchema = t.struct({
        enableHistory: t.Boolean,
        enableFeatureTable: t.Boolean,
        showLayerSwitcher: t.Boolean,
        showExportMap: t.Boolean,
        showLegend: t.Boolean
    })
    return formSchema
}

export const geocodingFormSchema = () => {
    const formSchema = t.struct({
        boundlessGeoCodingEnabled: t.maybe(t.Boolean),
        geocodingKey: t.maybe(t.String),
    })
    return formSchema
}