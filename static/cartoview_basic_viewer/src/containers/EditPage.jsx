import 'Source/css/app.css'
import 'react-select/dist/react-select.min.css'

import { doGet, doPost } from 'cartoview-sdk/utils/utils'

import AppAccess from 'Source/components/edit/Access'
import AppConfiguration from 'Source/components/edit/AppConfiguration'
import Bookmarks from 'Source/components/edit/Bookmarks'
import Configuration from 'cartoview-sdk/services/Configuration'
import EditPageComponent from 'Source/components/edit/EditPage'
import GeocodingConfiguration from 'Source/components/edit/GeocodingConfiguration'
import MapSelector from 'Source/components/edit/MapSelector'
import PropTypes from 'prop-types'
import React from 'react'
import ToolConfiguration from 'Source/components/edit/ToolConfiguration'
import URLS from 'cartoview-sdk/urls/urls'

const LIMIT = 9
class EditPage extends React.Component {
    constructor(props) {
        super(props)
        const { urls } = this.props

        this.configService = new Configuration(urls.proxy)
        this.urls = new URLS(urls.proxy)
        const { config } = this.props
        this.state = {
            maps: [],
            userMaps: true,
            selectedMap: config ? config.map : null,
            loading: false,
            totalMaps: 0,
            layerAttributes: [],
            title: config ? config.title : null,
            abstract: config ? config.abstract : null,
            config: config ? config.config : null,
            tags: [],
            keywords: [],
            saving: false,
            errors: [],
            profiles: [],
            instanceId: config ? config.id : null,
            searchEnabled: false
        }
    }
    componentWillMount() {
        this.getMaps()
        this.getKeywords()
        this.getProfiles()
    }
    UserMapsChanged = () => {
        const { userMaps } = this.state
        this.setState({ userMaps: !userMaps }, this.getMaps)
    }
    getMaps = (offset = 0, limit = LIMIT) => {
        this.setState({ loading: true })
        const { username, urls } = this.props
        const { userMaps } = this.state
        const url = this.configService.getMapApiURL(urls.MapsAPI, username, userMaps, limit,
            offset)
        doGet(url).then(result => {
            this.setState({
                maps: result.objects,
                loading: false,
                totalMaps: result.meta.total_count
            })
        })
    }
    searchMapById = (id) => {
        const { maps } = this.state
        let result = null
        for (let map of maps) {
            if (map.id === id) {
                result = map
                break
            }
        }
        return result
    }
    handleSearchMode = (bool) => {
        this.setState({ searchEnabled: bool })
    }
    search = (text) => {
        this.setState({ loading: true, searchEnabled: true })
        const { username, urls } = this.props
        const { userMaps } = this.state
        const url = this.configService.getMapApiSearchURL(urls.MapsAPI, username, userMaps, text)
        doGet(url).then(result => {
            this.setState({
                maps: result.objects,
                loading: false
            })
        })
    }
    getAttributes = (typename) => {
        this.setState({ loading: true })
        const { urls } = this.props
        if (typename) {
            let url = urls.layerAttributes
            url = this.urls.getParamterizedURL(url, { 'layer__typename': typename })
            doGet(url).then(result => {
                this.setState({
                    layerAttributes: result.objects,
                    loading: false
                })
            })
        }
    }
    getKeywords = () => {
        this.setState({ loading: true })
        const { urls } = this.props
        const url = urls.keywordsAPI
        doGet(url).then(result => {
            this.setState({ keywords: result.objects, loading: false })
        })
    }
    getProfiles = () => {
        this.setState({ loading: true })
        const { urls } = this.props
        const url = urls.profilesAPI
        doGet(url).then(result => {
            this.setState({ profiles: result.objects, loading: false })
        })
    }
    getTags = () => {
        const { urls } = this.props
        doGet(urls.tagsAPI).then(result => {
            this.setState({ tags: result })
        })
    }
    selectMap = (map) => {
        this.setState({ selectedMap: map })
    }
    setStepRef = (name, ref) => {
        this[name] = ref
    }
    getSteps = () => {
        const { urls } = this.props
        const {
            maps,
            loading,
            selectedMap,
            userMaps,
            totalMaps,
            config,
            title,
            abstract,
            keywords,
            instanceId,
            searchEnabled,
            profiles
        } = this.state
        let steps = [
            {
                title: "Select Map",
                component: MapSelector,
                ref: 'mapStep',
                hasErrors: false,
                props: {
                    maps,
                    selectedMap,
                    loading,
                    selectMap: this.selectMap,
                    getMaps: this.getMaps,
                    userMaps,
                    totalMaps,
                    UserMapsChanged: this.UserMapsChanged,
                    limit: LIMIT,
                    urls,
                    search: this.search,
                    handleSearchMode: this.handleSearchMode,
                    searchEnabled
                }
            },
            {
                title: "General",
                component: AppConfiguration,
                ref: 'generalStep',
                hasErrors: false,
                props: {
                    abstract,
                    title,
                    selectedMap,
                    config,
                    allKeywords: keywords,
                    instanceId
                }
            },
            {
                title: "Acccess Configuration",
                component: AppAccess,
                ref: 'accessConfigurationStep',
                hasErrors: false,
                props: {
                    loading,
                    config,
                    profiles,
                }
            },
            {
                title: "Bookmarks",
                component: Bookmarks,
                ref: 'bookmarksStep',
                hasErrors: false,
                props: {
                    config,
                    instanceId
                }
            },
            {
                title: "GeoCoding",
                component: GeocodingConfiguration,
                ref: 'geocodingStep',
                hasErrors: false,
                props: {
                    config,
                    instanceId
                }
            },
            {
                title: "Navigation Tools",
                component: ToolConfiguration,
                ref: 'toolsStep',
                hasErrors: false,
                props: {
                    config,
                    save: this.save,
                    instanceId
                }
            }
        ]
        const { errors } = this.state
        errors.map(error => steps[error].hasError = true)
        return steps
    }
    toArray = (arrayOfStructs) => {
        let arr = []
        if (arrayOfStructs) {
            arrayOfStructs.forEach((struct) => {
                arr.push(struct.value)
            }, this)
        }
        return arr
    }
    prepareServerData = () => {
        const keywords = this.generalStep.getComponentValue().keywords
        const { selectedMap } = this.state
        let finalConfiguration = {
            map: selectedMap.id,
            ...this.generalStep.getComponentValue(),
            config: {
                ...this.toolsStep.getComponentValue(),
                ...this.bookmarksStep.getComponentValue(),
                ...this.geocodingStep.getComponentValue(),
            },
            access: this.accessConfigurationStep.getComponentValue(),
            keywords: this.toArray(keywords)
        }
        return finalConfiguration

    }
    sendConfiguration = () => {
        const { urls } = this.props
        const { instanceId, errors } = this.state
        if (errors.length == 0) {
            this.setState({ saving: true })
            const url = instanceId ? urls.editURL(instanceId) : urls.newURL
            const data = JSON.stringify(this.prepareServerData())
            doPost(url, data, { "Content-Type": "application/json; charset=UTF-8" }).then(result => {
                this.setState({
                    instanceId: result.id,
                    saving: false
                })
            })

        }

    }
    showComponentsErrors = (callBack) => {
        let errors = []
        const steps = this.getSteps()
        steps.map((step, index) => {
            const formValue = this[step.ref].getComponentValue()
            if (!formValue) {
                errors.push(index)
            }
        })
        this.setState({ errors }, callBack)
    }
    save = () => {
        this.showComponentsErrors(this.sendConfiguration)

    }
    validate = () => {
        this.showComponentsErrors(() => { })
    }
    getChildrenProps = () => {
        const props = {
            ...this.state,
            ...this.props,
            steps: this.getSteps(),
            setStepRef: this.setStepRef,
            save: this.save,
            validate: this.validate
        }
        return props
    }
    render() {
        return (
            <EditPageComponent childrenProps={this.getChildrenProps()} />
        )
    }
}
EditPage.propTypes = {
    urls: PropTypes.object.isRequired,
    config: PropTypes.object,
    username: PropTypes.string.isRequired
}
export default EditPage
