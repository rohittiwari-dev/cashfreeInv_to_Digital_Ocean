module.exports ={
    formate: 'A4',
    orientation: 'portrait',
    border: '07mm',
    header: {
        height: '04mm',
        contents: ''
    },
    footer: {
        height: '04mm',
        contents: {
            first: '<p style="text-align:center;color:red;">*This is System Generated Invoice no Signature or Stamp Required</p>',
            2: 'Second Page',
            default: '',
            last: 'Last Page'
        }
    }
}